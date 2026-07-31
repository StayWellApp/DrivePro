import { onRequest } from "firebase-functions/v2/https";
import { getFirestore } from "firebase-admin/firestore";
import { initializeApp } from "firebase-admin/app";
import Stripe from "stripe";

try {
  initializeApp();
} catch (e) {
  // Already initialized
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2025-01-27" as any,
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET || "";

/**
 * v2 Firebase Cloud Function handling Stripe webhook payments.
 * It strictly validates signatures, updates single-tenant student balance/credits in Firestore,
 * and maintains proper transactional integrity.
 */
export const stripeWebhook = onRequest({ cors: false }, async (req, res): Promise<any> => {
  const sig = req.headers["stripe-signature"] as string;
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(req.rawBody, sig, endpointSecret);
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  const db = getFirestore();

  // Handle successful checkout session (digital top-up)
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    const studentId = session.metadata?.studentId;
    const schoolId = session.metadata?.schoolId;
    const amountPaid = session.amount_total ? session.amount_total / 100 : 0;
    const creditsPurchased = session.metadata?.credits
      ? parseInt(session.metadata.credits, 10)
      : 0;

    if (!studentId || !schoolId) {
      console.error("Missing metadata (studentId or schoolId) in checkout session.");
      return res.status(400).send("Missing metadata.");
    }

    try {
      // Execute multi-tenant transactional update in Firestore
      const studentRef = db
        .collection("schools")
        .doc(schoolId)
        .collection("students")
        .doc(studentId);

      await db.runTransaction(async (transaction) => {
        const studentDoc = await transaction.get(studentRef);
        if (!studentDoc.exists) {
          throw new Error("Student document not found.");
        }

        const currentBalance = studentDoc.data()?.balance || 0;
        const currentCredits = studentDoc.data()?.lessonCredits || 0;

        transaction.update(studentRef, {
          balance: currentBalance + amountPaid,
          lessonCredits: currentCredits + creditsPurchased,
          updatedAt: new Date().toISOString(),
        });

        // Log Payment document
        const paymentRef = db
          .collection("schools")
          .doc(schoolId)
          .collection("payments")
          .doc();

        transaction.set(paymentRef, {
          id: paymentRef.id,
          schoolId,
          studentId,
          amount: amountPaid,
          status: "STRIPE_TOPUP",
          stripeSessionId: session.id,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      });

      console.log(`Successfully completed payment transaction of ${amountPaid} for student ${studentId}`);
    } catch (txError: any) {
      console.error("Transaction failed during Stripe checkout session update:", txError);
      return res.status(500).send("Database transaction error.");
    }
  }

  return res.status(200).json({ received: true });
});
