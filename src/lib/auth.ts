import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { pool } from "./db";

export type User = { id: string; email: string; plan: "free" | "pro"; role: "user" | "admin" };

const COOKIE = "oi_session";
const SESSION_DAYS = 30;

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  return `${salt}$${scryptSync(password, salt, 64).toString("hex")}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, key] = stored.split("$");
  if (!salt || !key) return false;
  const expected = Buffer.from(key, "hex");
  const actual = scryptSync(password, salt, 64);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

export async function createSession(userId: string): Promise<void> {
  const token = randomBytes(32).toString("hex");
  await pool.query(
    `INSERT INTO sessions (token, user_id, expires_at)
     VALUES ($1, $2, now() + make_interval(days => $3))`,
    [token, userId, SESSION_DAYS],
  );
  const jar = await cookies();
  jar.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  });
}

export async function destroySession(): Promise<void> {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (token) await pool.query(`DELETE FROM sessions WHERE token = $1`, [token]);
  jar.delete(COOKIE);
}

/** Người dùng từ session cookie; null khi chưa đăng nhập (coi như free tier). */
export async function getSessionUser(): Promise<User | null> {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  const { rows } = await pool.query(
    `SELECT u.id, u.email, u.plan, u.role
     FROM sessions s JOIN users u ON u.id = s.user_id
     WHERE s.token = $1 AND s.expires_at > now()`,
    [token],
  );
  const r = rows[0];
  if (!r) return null;
  return {
    id: r.id,
    email: r.email,
    plan: r.plan === "pro" ? "pro" : "free",
    role: r.role === "admin" ? "admin" : "user",
  };
}

// ----- Saved markets -----

export async function isSaved(userId: string, areaId: string): Promise<boolean> {
  const { rowCount } = await pool.query(
    `SELECT 1 FROM saved_markets WHERE user_id = $1 AND area_id = $2`,
    [userId, areaId],
  );
  return (rowCount ?? 0) > 0;
}

export async function getSavedAreas(
  userId: string,
): Promise<{ id: string; name: string; regionType: string; href: string; savedAt: string }[]> {
  const { rows } = await pool.query(
    `SELECT a.id, a.name, a.region_type, s.created_at
     FROM saved_markets s JOIN areas a ON a.id = s.area_id
     WHERE s.user_id = $1 ORDER BY s.created_at DESC`,
    [userId],
  );
  return rows.map((r) => {
    const parts = (r.id as string).split("-");
    const href = `/${parts[0]}/${parts[1]}${parts.length > 2 ? "/" + parts.slice(2).join("-") : ""}`;
    return {
      id: r.id,
      name: r.name,
      regionType: r.region_type,
      href,
      savedAt: new Date(r.created_at).toISOString().slice(0, 10),
    };
  });
}
