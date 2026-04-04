// apps/api/src/index.ts
import express, { Request, Response } from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { prisma } from '@repo/database';
import { generatePdf, ReportData } from './services/pdfGenerator.js';
import { handleStripeWebhook, createCheckoutSession } from './services/stripe.js';
import cron from 'node-cron';
import { sendLessonReminder } from './services/notifications.js';
import multer from 'multer';

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

// Webhook endpoint needs raw body
app.post('/webhooks/stripe', express.raw({ type: 'application/json' }), async (req: Request, res: Response): Promise<any> => {
  const sig = req.headers['stripe-signature'] as string;
  try {
    const result = await handleStripeWebhook(sig, req.body);
    return res.status(200).json(result);
  } catch (error: any) {
    console.error('Webhook processing failed:', error.message);
    return res.status(400).send(`Webhook Error: ${error.message}`);
  }
});

app.use(express.json());

// File upload setup
const upload = multer({ dest: 'uploads/' });

app.post('/vehicles/:id/documents', upload.single('file'), async (req: Request, res: Response): Promise<any> => {
  const vehicleId = req.params.id;
  const file = req.file;

  if (!file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  // In a real app, upload to Cloud Storage and save URL to DB
  console.log(`Uploaded document for vehicle ${vehicleId}: ${file.originalname}`);

  return res.status(200).json({ success: true, url: `https://storage.googleapis.com/drivepro-docs/${file.filename}` });
});

// Checkout Session Endpoint
app.post('/payments/create-checkout', async (req: Request, res: Response): Promise<any> => {
  const { studentId, amount } = req.body;
  try {
    const session = await createCheckoutSession(studentId, amount);
    return res.status(200).json({ url: session.url });
  } catch (error: any) {
    console.error('Checkout creation failed:', error.message);
    return res.status(500).json({ error: error.message });
  }
});

// Theory Questions Endpoint
app.get('/theory/questions', async (req: Request, res: Response): Promise<any> => {
  try {
    const questions = await prisma.theoryQuestion.findMany();
    return res.status(200).json(questions);
  } catch (error) {
    console.error('Error fetching theory questions:', error);
    return res.status(500).json({ error: 'Failed to fetch theory questions' });
  }
});

// Theory Result Endpoint
app.post('/theory/results', async (req: Request, res: Response): Promise<any> => {
  const { student_id, score, total, mode } = req.body;
  try {
    const result = await prisma.theoryResult.create({
      data: {
        student_id,
        score,
        total,
        mode,
      },
    });
    return res.status(200).json(result);
  } catch (error) {
    console.error('Error saving theory result:', error);
    return res.status(500).json({ error: 'Failed to save theory result' });
  }
});

// Dashcam Sync Endpoint
app.post('/lessons/:id/sync-dashcam', async (req: Request, res: Response): Promise<any> => {
  const lessonId = req.params.id as string;
  const { dashcam_start_time, school_id } = req.body;

  try {
    const activeSession = await prisma.lessonSession.findFirst({
      where: { lesson_id: lessonId, school_id: school_id as string },
      orderBy: { createdAt: 'desc' },
    });

    if (activeSession) {
      await prisma.lessonSession.update({
        where: { id: activeSession.id },
        data: { dashcam_start_time: new Date(dashcam_start_time) },
      });
      return res.status(200).json({ success: true });
    }
    return res.status(404).json({ error: 'No active session found' });
  } catch (error) {
    console.error('Error syncing dashcam:', error);
    return res.status(500).json({ error: 'Failed to sync dashcam' });
  }
});

// Heartbeat Endpoint
app.post('/lessons/:id/heartbeat', async (req: Request, res: Response): Promise<any> => {
  const lessonId = req.params.id as string;
  const { coordinates, faultPins, school_id } = req.body;

  if (!school_id) {
    return res.status(400).json({ error: 'school_id is required' });
  }

  // Save GPS route to DB
  try {
    const activeSession = await prisma.lessonSession.findFirst({
      where: {
        lesson_id: lessonId,
        school_id: school_id as string,
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    if (activeSession) {
      // PostGIS LineString requires at least 2 points.
      // For the first point, we create a zero-length line with two identical points.
      await prisma.$executeRaw`
        UPDATE "LessonSession"
        SET gps_route = CASE
          WHEN gps_route IS NULL THEN ST_GeomFromText(${`LINESTRING(${coordinates.longitude} ${coordinates.latitude}, ${coordinates.longitude} ${coordinates.latitude})`}, 4326)
          ELSE ST_AddPoint(gps_route::geometry, ST_MakePoint(${coordinates.longitude}, ${coordinates.latitude})::geometry)
        END
        WHERE id = ${activeSession.id}
      `;
    }
  } catch (error) {
    console.error('Error saving GPS route:', error);
  }

  // Save FaultPins to DB
  if (faultPins && Array.isArray(faultPins) && faultPins.length > 0) {
    try {
      // Find the active LessonSession for this lesson
      const activeSession = await prisma.lessonSession.findFirst({
        where: {
          lesson_id: lessonId,
          school_id: school_id as string,
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      if (activeSession) {
        await prisma.faultPin.createMany({
          data: faultPins.map((pin: any) => {
            let video_offset_seconds = null;
            if (activeSession.dashcam_start_time) {
              video_offset_seconds = Math.floor(
                (new Date(pin.timestamp).getTime() - activeSession.dashcam_start_time.getTime()) / 1000
              );
            }
            return {
              school_id: school_id,
              lesson_session_id: activeSession.id,
              category: pin.category,
              timestamp: new Date(pin.timestamp),
              latitude: pin.location.latitude,
              longitude: pin.location.longitude,
              video_offset_seconds,
            };
          }),
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
app.post('/lessons/:id/finish', async (req: Request, res: Response): Promise<any> => {
  const lessonId = req.params.id as string;
  const { school_id } = req.body;

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

    // Trigger PDF generation and mock email sending
    const pdfBuffer = await generatePdf(reportData);
    console.log(`Generated PDF for student ${lesson.student.email}`);

    // Update student skill tree (mock update)
    console.log(`Updating skill tree for student ${lesson.student.id} based on ${faultPins.length} faults`);

    // Update lesson end time
    await prisma.lesson.update({
      where: { id: lessonId },
      data: { endTime: new Date() }
    });

    return res.status(200).json({ success: true, message: 'Lesson finalized, report sent.' });
  } catch (error) {
    console.error('Error finishing lesson:', error);
    return res.status(500).json({ error: 'Failed to finish lesson' });
  }
});

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

// Schedule lesson reminders (every day at 8 AM)
cron.schedule('0 8 * * *', async () => {
  console.log('Running daily lesson reminders...');
  // Check Fleet Health
  const vehicles = await prisma.vehicle.findMany();
  for (const vehicle of vehicles) {
    const alertThresholdKm = 500;
    if (vehicle.nextServiceMileage && (vehicle.nextServiceMileage - vehicle.current_mileage <= alertThresholdKm)) {
      console.log(`FLEET ALERT: Vehicle ${vehicle.licensePlate} needs service soon (${vehicle.nextServiceMileage - vehicle.current_mileage}km remaining)`);
      // In real app, push notification to Admin
    }
    const alertThresholdDays = 30;
    const today = new Date();
    if (vehicle.nextServiceDate) {
      const diffDays = (new Date(vehicle.nextServiceDate).getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
      if (diffDays <= alertThresholdDays) {
        console.log(`FLEET ALERT: Vehicle ${vehicle.licensePlate} service date approaching (${Math.round(diffDays)} days remaining)`);
      }
    }
  }

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  const dayAfterTomorrow = new Date(tomorrow);
  dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);

  const lessons = await prisma.lesson.findMany({
    where: {
      startTime: {
        gte: tomorrow,
        lt: dayAfterTomorrow,
      },
    },
  });

  for (const lesson of lessons) {
    await sendLessonReminder(lesson.id);
  }
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
