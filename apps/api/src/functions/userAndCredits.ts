import { onRequest } from "firebase-functions/v2/https";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import { initializeApp } from "firebase-admin/app";

try {
  initializeApp();
} catch (e) {
  // Already initialized
}

/**
 * v2 Firebase Cloud Function: Securely provisions a new user (Student or Instructor).
 * It creates the record in Firebase Auth, assigns Custom Claims, and registers them in Firestore.
 */
export const provisionUser = onRequest({ cors: true }, async (req, res): Promise<any> => {
  // 1. Authorization: Only SUPER_ADMIN or SCHOOL_ADMIN can provision users
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized access" });
  }

  const tokenStr = authHeader.split("Bearer ")[1];
  const auth = getAuth();
  const db = getFirestore();

  try {
    const decodedToken = await auth.verifyIdToken(tokenStr);
    const callerRole = decodedToken.role;
    const callerSchoolId = decodedToken.schoolId;

    if (callerRole !== "SUPER_ADMIN" && callerRole !== "ADMIN") {
      return res.status(403).json({ error: "Forbidden: Insufficient privileges" });
    }

    const { email, password, firstName, lastName, phoneNumber, role, schoolId, courseType, branchId } = req.body;

    // Enforce single-tenant boundary: School Admin can only provision users under their own school
    const targetSchoolId = callerRole === "SUPER_ADMIN" ? schoolId : callerSchoolId;
    if (!targetSchoolId) {
      return res.status(400).json({ error: "Missing schoolId association." });
    }

    // 2. Create the user in Firebase Auth
    const userRecord = await auth.createUser({
      email,
      password,
      displayName: `${firstName} ${lastName}`.trim(),
      phoneNumber: phoneNumber || undefined,
    });

    // 3. Attach Custom Claims (role, schoolId) to the user's token
    await auth.setCustomUserClaims(userRecord.uid, {
      role,
      schoolId: targetSchoolId,
    });

    // 4. Create the global user lookup document
    await db.collection("users").doc(userRecord.uid).set({
      id: userRecord.uid,
      email,
      firstName: firstName || null,
      lastName: lastName || null,
      phoneNumber: phoneNumber || null,
      role,
      schoolId: targetSchoolId,
      branchId: branchId || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // 5. Create role-specific document (Student or Instructor profile) under the school sub-tree
    if (role === "STUDENT") {
      await db
        .collection("schools")
        .doc(targetSchoolId)
        .collection("students")
        .doc(userRecord.uid)
        .set({
          id: userRecord.uid,
          schoolId: targetSchoolId,
          branchId: branchId || null,
          instructorId: null,
          name: `${firstName} ${lastName}`.trim(),
          balance: 0.0,
          lessonCredits: 0,
          courseType: courseType || "B",
          stripeCustomerId: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
    } else if (role === "INSTRUCTOR") {
      await db
        .collection("schools")
        .doc(targetSchoolId)
        .collection("instructors")
        .doc(userRecord.uid)
        .set({
          id: userRecord.uid,
          schoolId: targetSchoolId,
          branchId: branchId || null,
          name: `${firstName} ${lastName}`.trim(),
          availability: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
    }

    return res.status(200).json({
      success: true,
      uid: userRecord.uid,
      message: `Successfully provisioned ${role} user.`,
    });
  } catch (error: any) {
    console.error("Error provisioning user:", error);
    return res.status(500).json({ error: error.message || "Failed to provision user." });
  }
});

/**
 * v2 Firebase Cloud Function: Securely adds manual cash credit to a student.
 */
export const addManualCredit = onRequest({ cors: true }, async (req, res): Promise<any> => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized access" });
  }

  const tokenStr = authHeader.split("Bearer ")[1];
  const auth = getAuth();
  const db = getFirestore();

  try {
    const decodedToken = await auth.verifyIdToken(tokenStr);
    const callerRole = decodedToken.role;
    const callerSchoolId = decodedToken.schoolId;

    // Only school admins (or super admins) can adjust manual cash credits
    if (callerRole !== "SUPER_ADMIN" && callerRole !== "ADMIN") {
      return res.status(403).json({ error: "Forbidden: Insufficient privileges" });
    }

    const { studentId, schoolId, amount, credits } = req.body;
    const targetSchoolId = callerRole === "SUPER_ADMIN" ? schoolId : callerSchoolId;

    if (!targetSchoolId || !studentId) {
      return res.status(400).json({ error: "Missing studentId or schoolId" });
    }

    const studentRef = db
      .collection("schools")
      .doc(targetSchoolId)
      .collection("students")
      .doc(studentId);

    // Multi-tenant isolation transaction
    await db.runTransaction(async (transaction) => {
      const studentDoc = await transaction.get(studentRef);
      if (!studentDoc.exists) {
        throw new Error("Student record does not exist in target school.");
      }

      const currentBalance = studentDoc.data()?.balance || 0;
      const currentCredits = studentDoc.data()?.lessonCredits || 0;

      transaction.update(studentRef, {
        balance: currentBalance + (amount || 0.0),
        lessonCredits: currentCredits + (credits || 0),
        updatedAt: new Date().toISOString(),
      });

      const paymentRef = db
        .collection("schools")
        .doc(targetSchoolId)
        .collection("payments")
        .doc();

      transaction.set(paymentRef, {
        id: paymentRef.id,
        schoolId: targetSchoolId,
        studentId,
        amount: amount || 0.0,
        status: "CASH_PAYMENT",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    });

    return res.status(200).json({
      success: true,
      message: `Manual cash credit of ${amount} Czech Korunas (and ${credits} credits) successfully loaded.`,
    });
  } catch (error: any) {
    console.error("Error adding manual credit:", error);
    return res.status(500).json({ error: error.message || "Failed to add manual credit." });
  }
});
