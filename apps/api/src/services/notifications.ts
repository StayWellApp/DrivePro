import { prisma } from '@repo/database';

/**
 * Placeholder for Twilio (SMS)
 */
const sendSms = async (to: string, body: string) => {
  // In production: const client = new twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);
  // await client.messages.create({ body, to, from: process.env.TWILIO_NUMBER });
  console.log(`[TWILIO SMS] To: ${to} | Message: ${body}`);
};

/**
 * Placeholder for Resend/SendGrid (Email)
 */
const sendEmail = async (to: string, subject: string, body: string) => {
  // In production: const resend = new Resend(process.env.RESEND_API_KEY);
  // await resend.emails.send({ from: 'DrivePro <alerts@drivepro.com>', to, subject, html: body });
  console.log(`[RESEND EMAIL] To: ${to} | Subject: ${subject} | Message: ${body}`);
};

export const sendLessonReminder = async (lessonId: string) => {
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: {
      student: { include: { user: true } },
      instructor: { include: { user: true } }
    },
  });

  if (lesson && lesson.student.user) {
    const studentName = lesson.student.user.firstName || 'Student';
    const instructorName = `${lesson.instructor.user.firstName} ${lesson.instructor.user.lastName}`;
    const startTime = lesson.startTime.toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' });

    const message = `Ahoj ${studentName}, připomínáme tvou zítřejší lekci autoškoly v ${startTime} s instruktorem ${instructorName}. Těšíme se!`;

    // Send via both for maximum reliability during pilot
    if (lesson.student.user.phoneNumber) {
      await sendSms(lesson.student.user.phoneNumber, message);
    }

    if (lesson.student.user.email) {
      await sendEmail(lesson.student.user.email, 'Připomínka zítřejší lekce autoškoly', message);
    }
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

  if (lesson && lesson.student.user) {
    const instructorName = `${lesson.instructor.user.firstName} ${lesson.instructor.user.lastName}`;
    const message = `Důležité: Tvoje lekce autoškoly dne ${lesson.startTime.toLocaleDateString('cs-CZ')} s instruktorem ${instructorName} byla zrušena.`;

    if (lesson.student.user.phoneNumber) {
      await sendSms(lesson.student.user.phoneNumber, message);
    }
    if (lesson.student.user.email) {
      await sendEmail(lesson.student.user.email, 'Lekce zrušena', message);
    }
  }
};

export const sendLowBalanceAlert = async (studentId: string) => {
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: { user: true }
  });

  if (student && student.user && student.balance < 500) {
    const message = `Tvůj kredit je nízký (${student.balance} Kč). Prosím dobij si ho, aby nedošlo k rušení lekcí.`;

    if (student.user.phoneNumber) {
      await sendSms(student.user.phoneNumber, message);
    }
    if (student.user.email) {
      await sendEmail(student.user.email, 'Nízký zůstatek kreditu', message);
    }
  }
};
