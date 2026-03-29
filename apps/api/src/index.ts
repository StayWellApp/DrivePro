// apps/api/src/index.ts
import express, { Request, Response } from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

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
app.post('/lessons/:id/heartbeat', (req: Request, res: Response) => {
  const lessonId = req.params.id;
  const { coordinates, faultPins, school_id } = req.body;

  if (!school_id) {
    return res.status(400).json({ error: 'school_id is required' });
  }

  // TODO: Save to DB via Database package

  // Broadcast real-time position to Admin Map
  // Rooms can be used per school for multi-tenancy live map
  io.to(`school_${school_id}`).emit('lesson_update', {
    lessonId,
    coordinates,
    faultPins,
    timestamp: new Date().toISOString()
  });

  return res.status(200).json({ success: true });
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
