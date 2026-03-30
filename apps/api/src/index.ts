// apps/api/src/index.ts
import express, { Request, Response } from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { prisma } from 'database';
import { generatePdf, ReportData } from './services/pdfGenerator';

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
  const lessonId = req.params.id as string;
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
          lesson_id: lessonId as string,
          school_id: school_id
          lesson_id: lessonId,
          school_id: school_id as string
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      if (activeSession) {
        await prisma.faultPin.createMany({
          data: faultPins.map((pin: any) => ({
            school_id: school_id,
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

// Report Endpoint
app.get('/lessons/:id/report', async (req: Request, res: Response): Promise<any> => {
  const lessonId = req.params.id as string;

  try {
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: { student: true, instructor: true }
    });

    if (!lesson) {
      return res.status(404).json({ error: 'Lesson not found' });
    }

    const faultPins = await prisma.faultPin.findMany({
      where: { lessonSession: { lesson_id: lessonId } }
    });

    const faults: Record<string, number> = faultPins.reduce((acc: Record<string, number>, pin: any) => {
      acc[pin.category] = (acc[pin.category] || 0) + 1;
      return acc;
    }, {});

    const reportData: ReportData = {
      studentName: lesson.student.name,
      instructorName: lesson.instructor.name,
      startTime: lesson.startTime.toLocaleString(),
      faults
    };

    const pdfBuffer = await generatePdf(reportData);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=lesson-report-${lessonId}.pdf`);
    return res.status(200).send(pdfBuffer);
  } catch (error) {
    console.error('Error generating report:', error);
    return res.status(500).json({ error: 'Failed to generate report' });
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
