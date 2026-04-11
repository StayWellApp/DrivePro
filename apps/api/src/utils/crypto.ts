import crypto from 'crypto';

const SECRET = process.env.JWT_SECRET || 'drivepro-secret-key-2025';

export function generateSignedToken(studentId: string, expiresDays: number = 30) {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + expiresDays);

  const payload = JSON.stringify({ studentId, expiresAt: expiresAt.getTime() });
  const signature = crypto
    .createHmac('sha256', SECRET)
    .update(payload)
    .digest('hex');

  return Buffer.from(JSON.stringify({ payload, signature })).toString('base64url');
}

export function verifySignedToken(token: string) {
  try {
    const { payload, signature } = JSON.parse(Buffer.from(token, 'base64url').toString());
    const expectedSignature = crypto
      .createHmac('sha256', SECRET)
      .update(payload)
      .digest('hex');

    if (signature !== expectedSignature) return null;

    const data = JSON.parse(payload);
    if (data.expiresAt < Date.now()) return null;

    return data.studentId;
  } catch (e) {
    return null;
  }
}
