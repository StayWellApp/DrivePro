// apps/api/src/index.ts
import express, { Request, Response } from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { prisma } from 'database';

const app = express();
const server = createServer(app);

// Setup Socket.io
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.json());

// Heartbeat Endpoint
app.post('/lessons/:id/heartbeat', async (req: Request, res: Response): Promise<any> => {
  const lessonId = req.params.id;
  const { coordinates, faultPins, school_id } = req.body;

  if (!school_id) {
    return res.status(400).json({ error: 'school_id is required' });
  }

  // TODO: Save GPS route to DB via Database package

  // Save FaultPins to DB
  if (faultPins && Array.isArray(faultPins) && faultPins.length > 0) {
    try {
      // Find the active LessonSession for this lesson
      const activeSession = await prisma.lessonSession.findFirst({
        where: {
          lesson_id: String(lessonId),
          school_id: String(school_id)
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      if (activeSession) {
        await prisma.faultPin.createMany({
          data: faultPins.map((pin: any) => ({
            school_id: String(school_id),
            lesson_session_id: activeSession.id,
            category: pin.category,
            timestamp: new Date(pin.timestamp),
            latitude: pin.location.latitude,
            longitude: pin.location.longitude
          }))
        });
      } else {
        console.warn(`No active LessonSession found for lesson ${lessonId}`);
      }
    } catch (error) {
      console.error('Error saving fault pins:', error);
    }
  }

  // Broadcast real-time position AND real-time fault pins to Admin Map
  // Rooms can be used per school for multi-tenancy live map
  io.to(`school_${school_id}`).emit('lesson_update', {
    lessonId,
    coordinates,
    faultPins: faultPins || [],
    timestamp: new Date().toISOString()
  });

  return res.status(200).json({ success: true });
});

// Sync Video to Fault Pins
app.post('/lessons/:id/sync-video', async (req: Request, res: Response): Promise<any> => {
  const lessonId = req.params.id;
  const { school_id, video_file_name, video_start_timestamp } = req.body;

  if (!school_id || !video_file_name || !video_start_timestamp) {
    return res.status(400).json({ error: 'school_id, video_file_name, and video_start_timestamp are required' });
  }

  try {
    const videoStart = new Date(video_start_timestamp);

    // Find the active LessonSession for this lesson
    const session = await prisma.lessonSession.findFirst({
      where: {
        lesson_id: String(lessonId),
        school_id: String(school_id)
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    if (!session) {
      return res.status(404).json({ error: 'No active LessonSession found for this lesson' });
    }

    // Find all FaultPins for this session
    const faultPins = await prisma.faultPin.findMany({
      where: {
        lesson_session_id: session.id,
        school_id: String(school_id)
      }
    });

    // Calculate offset and update each FaultPin
    const updatePromises = faultPins.map(pin => {
      const offsetSeconds = Math.max(0, Math.floor((pin.timestamp.getTime() - videoStart.getTime()) / 1000));
      return prisma.faultPin.update({
        where: { id: pin.id },
        data: {
          video_file_name: video_file_name,
          video_offset_seconds: offsetSeconds
        }
      });
    });

    await Promise.all(updatePromises);

    return res.status(200).json({ success: true, updatedPins: faultPins.length });
  } catch (error) {
    console.error('Error syncing video to fault pins:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Get Replay Data
app.get('/lessons/:id/replay-data', async (req: Request, res: Response): Promise<any> => {
  const lessonId = req.params.id;
  const school_id = req.query.school_id as string;

  if (!school_id) {
    return res.status(400).json({ error: 'school_id is required as a query parameter' });
  }

  try {
    const session = await prisma.lessonSession.findFirst({
      where: {
        lesson_id: String(lessonId),
        school_id: String(school_id)
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    if (!session) {
      return res.status(404).json({ error: 'No active LessonSession found for this lesson' });
    }

    const faultPins = await prisma.faultPin.findMany({
      where: {
        lesson_session_id: session.id,
        school_id: String(school_id)
      },
      orderBy: {
        timestamp: 'asc'
      }
    });

    // Map fault pins to include video_timestamp as requested
    const formattedFaultPins = faultPins.map(pin => ({
      ...pin,
      video_timestamp: pin.video_offset_seconds
    }));

    // TODO: Retrieve actual GPS points when implemented.
    const gpsPoints: any[] = [];

    return res.status(200).json({
      gpsPoints: gpsPoints,
      faultPins: formattedFaultPins
    });
  } catch (error) {
    console.error('Error getting replay data:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

io.on('connection', (socket) => {
  console.log('A client connected:', socket.id);

  // Admins or clients can join a school room to receive updates
  socket.on('join_school', (school_id: string) => {
    socket.join(`school_${school_id}`);
    console.log(`Socket ${socket.id} joined room school_${school_id}`);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 8080;

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
