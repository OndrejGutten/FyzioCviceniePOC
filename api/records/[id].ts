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

  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).end("Method Not Allowed");
  }

  const { id } = req.query;
  if (!id || Array.isArray(id)) {
    return sendError(res, 400, "id required");
  }

  const doc = await db.collection("records").doc(id).get();
  if (!doc.exists) {
    return sendError(res, 404, "Record not found");
  }

  return res.status(200).json({ id: doc.id, ...doc.data() });
}
