import type { VercelRequest, VercelResponse } from "@vercel/node";

export default function handler(_req: VercelRequest, res: VercelResponse) {
  const base64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;
  const json = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

  res.status(200).json({
    hasBase64: Boolean(base64),
    base64Prefix: base64 ? base64.slice(0, 6) : null,
    base64Length: base64 ? base64.length : 0,
    hasJson: Boolean(json),
    jsonPrefix: json ? json.slice(0, 1) : null,
  });
}
