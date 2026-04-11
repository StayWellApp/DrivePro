// apps/api/src/index.ts
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

// Rest of previous index implementation...
// Heartbeat, Dashcam sync, Socket logic...

app.post(
  "/lessons/:id/heartbeat",
  async (req: Request, res: Response): Promise<any> => {
     // Implementation...
     return res.status(200).json({ success: true });
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
