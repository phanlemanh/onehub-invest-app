import { NextResponse } from "next/server";

import { getSessionUser } from "@/lib/auth";
import { canAccessOps } from "@/lib/ops-access";
import { cancelZaloLogin, startZaloLogin, zaloLoginStatus } from "@/lib/zalo-admin";

export const dynamic = "force-dynamic";

/**
 * Luồng QR login tài khoản zalouser từ web:
 *   POST   { accountId }   → spawn `channels login` detached, trả QR base64
 *   GET    ?account=<id>   → poll: QR + process còn sống + connected
 *   DELETE ?account=<id>   → huỷ process login
 * Lưu ý: connected là tín hiệu channel-level (v1) — đủ cho 1-2 tài khoản đầu.
 */
async function auth(req: Request): Promise<boolean> {
  const expected = process.env.OPS_API_TOKEN;
  const bearer = req.headers.get("authorization") ?? "";
  if (!!expected && bearer === `Bearer ${expected}`) return true;
  return canAccessOps(await getSessionUser());
}

export async function POST(req: Request) {
  if (!(await auth(req))) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { accountId } = (await req.json().catch(() => ({}))) as { accountId?: string };
  if (!accountId) return NextResponse.json({ error: "thiếu accountId" }, { status: 400 });
  try {
    const r = await startZaloLogin(accountId);
    return NextResponse.json(r);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "lỗi bắt đầu login" },
      { status: 500 },
    );
  }
}

export async function GET(req: Request) {
  if (!(await auth(req))) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const accountId = new URL(req.url).searchParams.get("account");
  if (!accountId) return NextResponse.json({ error: "thiếu account" }, { status: 400 });
  return NextResponse.json(await zaloLoginStatus(accountId));
}

export async function DELETE(req: Request) {
  if (!(await auth(req))) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const accountId = new URL(req.url).searchParams.get("account");
  if (!accountId) return NextResponse.json({ error: "thiếu account" }, { status: 400 });
  await cancelZaloLogin(accountId);
  return NextResponse.json({ ok: true });
}
