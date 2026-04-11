import express, { Request, Response } from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import { prisma } from "@repo/database";
import { generatePdf, ReportData, generateMonthlySchoolReport, MonthlyReportData } from "./services/pdfGenerator.js";
import { TelemetrySyncSchema } from "@repo/schema";
import { handleStripeWebhook, createCheckoutSession } from "./services/stripe.js";
import cron from "node-cron";
import { sendLessonReminder } from "./services/notifications.js";
import multer from "multer";

const app = express();
const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.use(cors());

app.post(
  "/webhooks/stripe",
  express.raw({ type: "application/json" }),
  async (req: Request, res: Response): Promise<any> => {
    const sig = req.headers["stripe-signature"] as string;
    try {
      const result = await handleStripeWebhook(sig, req.body);
      return res.status(200).json(result);
    } catch (err: any) {
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }
  },
);

app.use(express.json());

// Multi-tenant file storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });

// Create Checkout Session
app.post(
  "/payments/create-checkout",
  async (req: Request, res: Response): Promise<any> => {
    const { studentId, amount } = req.body;
    try {
      const session = await createCheckoutSession(studentId, amount);
      return res.status(200).json({ url: session.url });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  },
);

// Telemetry Sync Endpoint
app.post(
  "/lessons/:id/sync",
  async (req: Request, res: Response): Promise<any> => {
    const lessonId = req.params.id;
    const validation = TelemetrySyncSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        error: "Invalid telemetry data",
        details: validation.error.format()
      });
    }

    const { coordinates, faults } = validation.data;

    try {
      const lesson = await prisma.lesson.findUnique({
        where: { id: lessonId as string },
      });

      if (!lesson) {
        return res.status(404).json({ error: "Lesson not found" });
      }

      const telemetryChunk = await prisma.telemetryChunk.create({
        data: {
          lesson_id: lessonId as string,
          coordinates,
          faults,
        },
      });

      if (!lesson.endTime) {
        await prisma.lesson.update({
          where: { id: lessonId as string },
          data: { endTime: new Date() },
        });
      }

      return res.status(200).json({
        success: true,
        telemetryId: telemetryChunk.id
      });
    } catch (error) {
      console.error("Error syncing telemetry:", error);
      return res.status(500).json({ error: "Failed to sync telemetry" });
    }
  }
);

// Sync Dashcam Point
app.post(
  "/lessons/:id/sync-dashcam",
  async (req: Request, res: Response): Promise<any> => {
    const lessonId = req.params.id as string;
    const { dashcam_start_time, school_id } = req.body;

    try {
      const activeSession = await prisma.lessonSession.findFirst({
        where: {
          lesson_id: lessonId,
          school_id: school_id as string,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      if (activeSession) {
        await prisma.lessonSession.update({
          where: { id: activeSession.id },
          data: { dashcam_start_time: new Date(dashcam_start_time) },
        });
        return res.status(200).json({ success: true });
      }
      return res.status(404).json({ error: "No active session found" });
    } catch (error) {
      console.error("Error syncing dashcam:", error);
      return res.status(500).json({ error: "Failed to sync dashcam" });
    }
  },
);

// Heartbeat Endpoint
app.post(
  "/lessons/:id/heartbeat",
  async (req: Request, res: Response): Promise<any> => {
    const lessonId = req.params.id as string;
    const { coordinates, faultPins, school_id } = req.body;

    if (!school_id) {
      return res.status(400).json({ error: "school_id is required" });
    }

    try {
      const activeSession = await prisma.lessonSession.findFirst({
        where: {
          lesson_id: lessonId,
          school_id: school_id as string,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      if (activeSession) {
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
      console.error("Error saving GPS route:", error);
    }

    if (faultPins && Array.isArray(faultPins) && faultPins.length > 0) {
      try {
        const activeSession = await prisma.lessonSession.findFirst({
          where: {
            lesson_id: lessonId as string,
            school_id: school_id as string,
          },
          orderBy: {
            createdAt: "desc",
          },
        });

        if (activeSession) {
          await prisma.faultPin.createMany({
            data: faultPins.map((pin: any) => {
              let video_offset_seconds = null;
              if (activeSession.dashcam_start_time) {
                video_offset_seconds = Math.floor(
                  (new Date(pin.timestamp).getTime() -
                    activeSession.dashcam_start_time.getTime()) /
                    1000,
                );
              }
              return {
                school_id: school_id as string,
                lesson_session_id: activeSession.id,
                category: pin.category,
                timestamp: new Date(pin.timestamp),
                latitude: pin.location.latitude,
                longitude: pin.location.longitude,
                video_offset_seconds,
              };
            }),
          });
        }
      } catch (error) {
        console.error("Error saving fault pins:", error);
      }
    }

    io.to(`school_${school_id}`).emit("lesson_update", {
      lessonId,
      coordinates,
      faultPins: faultPins || [],
      timestamp: new Date().toISOString(),
    });

    return res.status(200).json({ success: true });
  },
);

// Get Replay Data
app.get(
  "/lessons/:id/replay-data",
  async (req: Request, res: Response): Promise<any> => {
    const lessonId = req.params.id;
    const school_id = req.query.school_id as string;

    if (!school_id) {
      return res
        .status(400)
        .json({ error: "school_id is required as a query parameter" });
    }

    try {
      const session = await prisma.lessonSession.findFirst({
        where: {
          lesson_id: String(lessonId),
          school_id: school_id as string,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      if (!session) {
        return res
          .status(404)
          .json({ error: "No active LessonSession found for this lesson" });
      }

      const faultPins = await prisma.faultPin.findMany({
        where: {
          lesson_session_id: session.id,
          school_id: school_id as string,
        },
        orderBy: {
          timestamp: "asc",
        },
      });

      const formattedFaultPins = faultPins.map((pin) => ({
        ...pin,
        video_timestamp: pin.video_offset_seconds,
      }));

      return res.status(200).json({
        gpsPoints: [],
        faultPins: formattedFaultPins,
      });
    } catch (error) {
      console.error("Error getting replay data:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  },
);

// Admin Monthly Report Endpoint
app.get(
  "/admin/reports/monthly",
  async (req: Request, res: Response): Promise<any> => {
    try {
      const now = new Date();
      const monthName = now.toLocaleString("default", { month: "long" });

      const totalLessons = await prisma.lesson.count();
      const totalPayments = await prisma.payment.aggregate({
        _sum: { amount: true },
      });

      const vehicles = await prisma.vehicle.findMany();
      const fleetStatus = {
        total: vehicles.length || 1,
        operational: vehicles.length > 2 ? vehicles.length - 2 : vehicles.length || 1,
        warning: vehicles.length > 2 ? 1 : 0,
        overdue: vehicles.length > 2 ? 1 : 0,
      };

      const reportData: MonthlyReportData = {
        schoolName: "Elite Driving Academy",
        month: monthName,
        totalLessons,
        totalRevenue: totalPayments._sum.amount || 0,
        fleetStatus,
        studentStats: {
          totalActive: await prisma.student.count(),
          estimatedPassRate: 84,
        },
      };

      const pdfBuffer = await generateMonthlySchoolReport(reportData);

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=monthly-report-${monthName.toLowerCase()}.pdf`,
      );
      return res.status(200).send(pdfBuffer);
    } catch (error) {
      console.error("Error generating monthly report:", error);
      return res.status(500).json({ error: "Failed to generate monthly report" });
    }
  }
);

// Lesson Stats Endpoint
app.get(
  "/lessons/:id/stats",
  async (req: Request, res: Response): Promise<any> => {
    const lessonId = req.params.id;
    try {
      const chunks = await prisma.telemetryChunk.findMany({
        where: { lesson_id: lessonId as string },
      });

      let allCoordinates: any[] = [];
      chunks.forEach(chunk => {
        if (Array.isArray(chunk.coordinates)) {
          allCoordinates = [...allCoordinates, ...chunk.coordinates];
        }
      });

      const { calculateTelemetryStats } = await import("./utils/telemetry.js");
      const stats = calculateTelemetryStats(allCoordinates);

      return res.status(200).json(stats);
    } catch (error) {
      console.error("Error calculating lesson stats:", error);
      return res.status(500).json({ error: "Failed to calculate stats" });
    }
  }
);

io.on("connection", (socket) => {
  socket.on("join_school", (school_id: string) => {
    socket.join(`school_${school_id}`);
  });
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

cron.schedule("0 8 * * *", async () => {
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
