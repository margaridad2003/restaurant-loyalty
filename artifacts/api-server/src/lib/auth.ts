import { createHmac } from "crypto";

const SECRET = process.env.SESSION_SECRET ?? "fallback-dev-secret-change-in-prod";
const TOKEN_TTL_DAYS = 30;

export function signToken(customerId: number): string {
  const exp = Date.now() + TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000;
  const payload = `${customerId}.${exp}`;
  const sig = createHmac("sha256", SECRET).update(payload).digest("hex");
  return `${payload}.${sig}`;
}

export function verifyToken(token: string): number | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const [idStr, expStr, sig] = parts;
    const exp = Number(expStr);
    if (Date.now() > exp) return null;
    const payload = `${idStr}.${expStr}`;
    const expected = createHmac("sha256", SECRET).update(payload).digest("hex");
    if (sig !== expected) return null;
    const id = parseInt(idStr, 10);
    if (isNaN(id)) return null;
    return id;
  } catch {
    return null;
  }
}

export function extractBearerToken(authHeader: string | undefined): string | null {
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
  return authHeader.slice(7);
}
