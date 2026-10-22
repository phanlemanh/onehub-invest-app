import { NextResponse } from "next/server";

import { getSessionUser } from "@/lib/auth";
import { canAccessOps } from "@/lib/ops-access";
import { auditOpsWrite } from "@/lib/audit";
import { createZaloAccount, deleteZaloAccount, listZaloAccounts } from "@/lib/zalo-admin";

export const dynamic = "force-dynamic";

/**
 * GET  /api/v1/ops/zalo/accounts — danh sách tài khoản zalouser + nhóm đang bật
 * POST { id, name? } — tạo tài khoản mới (groups tường minh rỗng — bất biến 1-1)
 * DELETE { id } — gỡ tài khoản (trừ default)
 * Auth ops như thường lệ (session hoặc Bearer OPS_API_TOKEN).
 */
async function auth(req: Request): Promise<boolean> {
  const expected = process.env.OPS_API_TOKEN;
  const bearer = req.headers.get("authorization") ?? "";
  if (!!expected && bearer === `Bearer ${expected}`) return true;
  return canAccessOps(await getSessionUser());
}

export async function GET(req: Request) {
  if (!(await auth(req))) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  return NextResponse.json({ accounts: await listZaloAccounts() });
}

export async function POST(req: Request) {
  if (!(await auth(req))) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const body = (await req.json().catch(() => ({}))) as { id?: string; name?: string };
  try {
    const account = await createZaloAccount((body.id ?? "").trim(), body.name?.trim() || undefined);
    auditOpsWrite("api:zalo-admin", "zalo.account.create", { accountId: account.accountId });
    return NextResponse.json({ account });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "lỗi tạo tài khoản" },
      { status: 400 },
    );
  }
}

export async function DELETE(req: Request) {
  if (!(await auth(req))) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const body = (await req.json().catch(() => ({}))) as { id?: string };
  try {
    await deleteZaloAccount((body.id ?? "").trim());
    auditOpsWrite("api:zalo-admin", "zalo.account.delete", { accountId: (body.id ?? "").trim() });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "lỗi xoá tài khoản" },
      { status: 400 },
    );
  }
}
