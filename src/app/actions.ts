"use server";

import { randomBytes } from "node:crypto";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { pool } from "@/lib/db";
import { safeNext } from "@/lib/safe-next";
import {
  createSession,
  destroySession,
  getSessionUser,
  hashPassword,
  verifyPassword,
} from "@/lib/auth";


export async function login(formData: FormData): Promise<void> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const next = safeNext(formData.get("next") as string | null);
  if (!email || !password) {
    redirect(`/login?error=${encodeURIComponent("Nhập email và mật khẩu")}&next=${encodeURIComponent(next)}`);
  }
  const { rows } = await pool.query(
    `SELECT id, password_hash FROM users WHERE email = $1`,
    [email],
  );
  const user = rows[0];
  if (!user || !verifyPassword(password, user.password_hash)) {
    redirect(`/login?error=${encodeURIComponent("Email hoặc mật khẩu không đúng")}&next=${encodeURIComponent(next)}`);
  }
  await createSession(user.id);
  redirect(next);
}

export async function register(formData: FormData): Promise<void> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const next = safeNext(formData.get("next") as string | null);
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || password.length < 8) {
    redirect(
      `/register?error=${encodeURIComponent("Cần email hợp lệ và mật khẩu từ 8 ký tự")}&next=${encodeURIComponent(next)}`,
    );
  }
  const id = `usr_${randomBytes(8).toString("hex")}`;
  const { rowCount } = await pool.query(
    `INSERT INTO users (id, email, password_hash) VALUES ($1, $2, $3)
     ON CONFLICT (email) DO NOTHING`,
    [id, email, hashPassword(password)],
  );
  if (!rowCount) {
    redirect(`/register?error=${encodeURIComponent("Email này đã có tài khoản — hãy đăng nhập")}&next=${encodeURIComponent(next)}`);
  }
  await createSession(id);
  redirect(next);
}

export async function logout(): Promise<void> {
  await destroySession();
  revalidatePath("/", "layout");
  redirect("/");
}

/** Toggle lưu/bỏ lưu một area; chuyển hướng đăng nhập nếu chưa có session. */
export async function toggleSaved(formData: FormData): Promise<void> {
  const areaId = String(formData.get("areaId") ?? "");
  const redirectTo = safeNext(formData.get("redirectTo") as string | null);
  const user = await getSessionUser();
  if (!user) {
    redirect(`/login?error=${encodeURIComponent("Đăng nhập để lưu khu vực")}&next=${encodeURIComponent(redirectTo)}`);
  }
  const { rowCount } = await pool.query(
    `DELETE FROM saved_markets WHERE user_id = $1 AND area_id = $2`,
    [user.id, areaId],
  );
  if (!rowCount) {
    await pool.query(
      `INSERT INTO saved_markets (user_id, area_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
      [user.id, areaId],
    );
  }
  revalidatePath("/", "layout");
  redirect(redirectTo);
}
