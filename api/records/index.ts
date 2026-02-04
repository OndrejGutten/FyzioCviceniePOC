import type { VercelRequest, VercelResponse } from "@vercel/node";
import admin from "firebase-admin";

const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
  : null;

if (!admin.apps.length && serviceAccount) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.apps.length ? admin.firestore() : null;

const sendError = (res: VercelResponse, status: number, message: string) => {
  res.status(status).json({ error: message });
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!db) {
    return sendError(res, 500, "Firestore not configured");
  }

  if (req.method === "POST") {
    const { aches, minutes, change, userId } = req.body ?? {};
    if (!aches || !minutes || !change || !userId) {
      return sendError(res, 400, "Missing fields");
    }

    const record = {
      aches,
      minutes: Number(minutes),
      change,
      userId,
      timestamp: new Date().toISOString(),
    };

    const docRef = await db.collection("records").add(record);
    return res.status(201).json({ id: docRef.id, ...record });
  }

  if (req.method === "GET") {
    const { scope, userId } = req.query;
    const baseQuery = db.collection("records").orderBy("timestamp", "desc");

    if (scope === "all") {
      const snapshot = await baseQuery.get();
      const records = snapshot.docs.map(
        (doc: admin.firestore.QueryDocumentSnapshot) => ({
          id: doc.id,
          ...doc.data(),
        }),
      );
      return res.status(200).json({ records });
    }

    if (!userId || Array.isArray(userId)) {
      return sendError(res, 400, "userId required");
    }

    const snapshot = await baseQuery.where("userId", "==", userId).get();
    const records = snapshot.docs.map(
      (doc: admin.firestore.QueryDocumentSnapshot) => ({
        id: doc.id,
        ...doc.data(),
      }),
    );
    return res.status(200).json({ records });
  }

  res.setHeader("Allow", ["GET", "POST"]);
  return res.status(405).end("Method Not Allowed");
}
