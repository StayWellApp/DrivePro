import Stripe from "stripe";
import { prisma } from "@repo/database";
import { sendLowBalanceAlert } from "./notifications.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-02-24.acacia",
} as any);

export const createCheckoutSession = async (
  studentId: string,
  amount: number,
  currency: string = "czk"
) => {
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: { school: true, user: true },
  });

  if (!student) throw new Error("Student not found");

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    customer_email: student.user.email,
    line_items: [
      {
        price_data: {
          currency: currency.toLowerCase(),
          product_data: {
            name: "Lesson Credits Top-up",
          },
          unit_amount: amount * 100,
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: `${process.env.STUDENT_APP_URL}/topup/success`,
    cancel_url: `${process.env.STUDENT_APP_URL}/topup/cancel`,
    metadata: {
      studentId,
      schoolId: student.school_id,
    },
  });

  return session;
};

export const handleStripeWebhook = async (sig: string, body: Buffer) => {
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch (err: any) {
    throw new Error(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const studentId = session.metadata?.studentId;
    const amount = session.amount_total ? session.amount_total / 100 : 0;

    if (studentId) {
      await prisma.$transaction([
        prisma.student.update({
          where: { id: studentId },
          data: { balance: { increment: amount } },
        }),
        prisma.payment.create({
          data: {
            student_id: studentId,
            school_id: session.metadata?.schoolId!,
            amount,
            status: "completed",
          },
        }),
      ]);

      // Potential low balance alert check (if top-up was small)
      await sendLowBalanceAlert(studentId);
    }
  }

  return { received: true };
};
