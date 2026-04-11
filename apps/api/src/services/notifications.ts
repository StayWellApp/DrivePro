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
    include: {
      student: { include: { user: true } },
      instructor: { include: { user: true } }
    },
  });

  if (lesson) {
    const instructorName = `${lesson.instructor.user.firstName} ${lesson.instructor.user.lastName}`;
    const message = `Reminder: You have a driving lesson tomorrow at ${lesson.startTime.toLocaleTimeString()} with ${instructorName}.`;
    await sendSms('student-phone', message); // Student phone should be in DB
    // @ts-ignore
    await sendEmail(lesson.student.user.email, 'Driving Lesson Reminder', message);
  }
};

export const sendCancellationNotification = async (lessonId: string) => {
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: {
      student: { include: { user: true } },
      instructor: { include: { user: true } }
    },
  });

  if (lesson) {
    const instructorName = `${lesson.instructor.user.firstName} ${lesson.instructor.user.lastName}`;
    const message = `Important: Your driving lesson on ${lesson.startTime.toLocaleDateString()} with ${instructorName} has been cancelled.`;
    await sendSms('student-phone', message);
    // @ts-ignore
    await sendEmail(lesson.student.user.email, 'Lesson Cancelled', message);
  }
};

export const sendLowBalanceAlert = async (studentId: string) => {
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: { user: true }
  });

  if (student && student.balance < 500) {
    const message = `Your credit balance is low (${student.balance} CZK). Please top up to avoid lesson cancellations.`;
    await sendSms('student-phone', message);
    // @ts-ignore
    await sendEmail(student.user.email, 'Low Balance Alert', message);
  }
};
