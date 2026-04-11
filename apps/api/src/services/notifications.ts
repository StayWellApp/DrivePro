import { prisma } from '@repo/database';

// Mock service for Twilio/SendGrid
const sendSms = async (to: string, body: string) => {
  console.log(`Sending SMS to ${to}: ${body}`);
};

const sendEmail = async (to: string, subject: string, body: string) => {
  console.log(`Sending Email to ${to}: ${subject} - ${body}`);
};

export const sendLessonReminder = async (lessonId: string) => {
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: { student: true, instructor: true },
  });

  if (lesson) {
    const message = `Reminder: You have a driving lesson tomorrow at ${lesson.startTime.toLocaleTimeString()} with ${lesson.instructor.name}.`;
    await sendSms('student-phone', message); // Student phone should be in DB
    await sendEmail(lesson.student.email, 'Driving Lesson Reminder', message);
  }
};

export const sendCancellationNotification = async (lessonId: string) => {
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: { student: true, instructor: true },
  });

  if (lesson) {
    const message = `Important: Your driving lesson on ${lesson.startTime.toLocaleDateString()} with ${lesson.instructor.name} has been cancelled.`;
    await sendSms('student-phone', message);
    await sendEmail(lesson.student.email, 'Lesson Cancelled', message);
  }
};

export const sendLowBalanceAlert = async (studentId: string) => {
  const student = await prisma.student.findUnique({
    where: { id: studentId },
  });

  if (student && student.balance < 500) {
    const message = `Your credit balance is low (${student.balance} CZK). Please top up to avoid lesson cancellations.`;
    await sendSms('student-phone', message);
    await sendEmail(student.email, 'Low Balance Alert', message);
  }
};
