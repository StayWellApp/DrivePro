import { getHotspots, getReadinessScore } from "./services/aiAnalyzer.js";
import { generateSignedToken, verifySignedToken } from "./utils/crypto.js";
import express, { Request, Response } from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import { prisma } from "@repo/database";
import { generatePdf, ReportData, generateMonthlySchoolReport, MonthlyReportData } from "./services/pdfGenerator.js";
import { TelemetrySyncSchema } from "@repo/schema";
import cron from "node-cron";
import { sendLessonReminder } from "./services/notifications.js";
import multer from "multer";
import rateLimit from "express-rate-limit";
import { calculateVideoOffset } from "./services/videoProcessor.js";

const app = express();
const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const syncLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: "Too many sync requests from this IP, please try again after 15 minutes"
});

app.use(cors());
app.use(express.json());

app.get("/students/:id/intelligence", async (req: Request, res: Response): Promise<any> => {
  const studentId = req.params.id as string;
  try {
    const hotspots = await getHotspots(studentId);
    const readiness = await getReadinessScore(studentId);
    return res.status(200).json({ hotspots, readiness });
  } catch (error) {
    console.error("Error generating intelligence report:", error);
    return res.status(500).json({ error: "Failed to generate intelligence report" });
  }
});

app.post("/students/:id/sponsor-link", async (req: Request, res: Response): Promise<any> => {
  const id = req.params.id as string;
  const { passcode } = req.body;
  try {
    const token = generateSignedToken(id);
    const sponsorLink = await (prisma as any).sponsorLink.create({
      data: {
        token,
        student_id: id,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        passcode
      }
    });
    return res.status(200).json(sponsorLink);
  } catch (error) {
    return res.status(500).json({ error: "Failed to create sponsor link" });
  }
});

app.get("/shared/:token/verify", async (req: Request, res: Response): Promise<any> => {
  const token = req.params.token as string;
  const passcode = req.query.passcode as string;
  try {
    const studentId = verifySignedToken(token);
    if (!studentId) return res.status(401).json({ error: "Invalid or expired token" });

    const link = await (prisma as any).sponsorLink.findUnique({
      where: { token }
    });

    if (link?.passcode && link.passcode !== passcode) {
      return res.status(403).json({ error: "Invalid passcode" });
    }

    return res.status(200).json({ studentId });
  } catch (error) {
    return res.status(500).json({ error: "Verification failed" });
  }
});

app.patch("/lessons/:id/cancel", async (req: Request, res: Response): Promise<any> => {
  const id = req.params.id as string;
  const { mode } = req.body;

  try {
    const lesson = await (prisma as any).lesson.findUnique({
      where: { id },
      include: { student: true }
    });

    if (!lesson) return res.status(404).json({ error: "Lesson not found" });

    await (prisma as any).lesson.update({
      where: { id },
      data: { status: 'CANCELLED' }
    });

    if (mode === 'REFUND') {
      await (prisma as any).student.update({
        where: { id: lesson.student_id },
        data: { lessonCredits: { increment: 1 } }
      });
    }

    return res.status(200).json({ success: true, mode });
  } catch (error) {
    console.error("Cancellation error:", error);
    return res.status(500).json({ error: "Failed to cancel lesson" });
  }
});

app.post("/students/:id/manual-credit", async (req: Request, res: Response): Promise<any> => {
  const id = req.params.id as string;
  const { amount, credits } = req.body;

  try {
    const student = await (prisma as any).student.update({
      where: { id },
      data: {
        lessonCredits: { increment: credits || 0 },
        balance: { increment: amount || 0 }
      }
    });

    await (prisma as any).payment.create({
      data: {
        school_id: student.school_id,
        student_id: id,
        amount: amount || 0,
        status: "CASH_PAYMENT"
      }
    });

    return res.status(200).json(student);
  } catch (error) {
    return res.status(500).json({ error: "Failed to add manual credit" });
  }
});

app.post("/theory/attempts", async (req: Request, res: Response): Promise<any> => {
  const { studentId, score, total, passed, answers } = req.body;
  try {
    const attempt = await (prisma as any).studentExamAttempt.create({
      data: {
        student_id: studentId,
        score,
        total,
        passed,
        answers,
      },
    });
    return res.status(200).json(attempt);
  } catch (error) {
    return res.status(500).json({ error: "Failed to save theory attempt" });
  }
});

app.patch("/lessons/:id/faults", syncLimiter, async (req: Request, res: Response): Promise<any> => {
  const id = req.params.id as string;
  const { faultPins } = req.body;

  try {
    const lesson = await (prisma as any).lesson.findUnique({
      where: { id }
    });

    if (!lesson) return res.status(404).json({ error: "Lesson not found" });

    const updatedPins = faultPins.map((pin: any) => ({
      ...pin,
      video_offset_seconds: calculateVideoOffset(new Date(pin.timestamp), lesson.videoStartTime)
    }));

    return res.status(200).json({ updatedPins });
  } catch (error) {
    return res.status(500).json({ error: "Failed to update fault pins" });
  }
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

cron.schedule("0 8 * * *", async () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  const lessons = await (prisma as any).lesson.findMany({
    where: {
      startTime: { gte: tomorrow, lt: new Date(tomorrow.getTime() + 86400000) },
      status: 'SCHEDULED'
    },
  });

  for (const lesson of lessons) {
    await sendLessonReminder(lesson.id);
  }
});
