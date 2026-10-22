import { NextResponse } from "next/server";

import { getSessionUser } from "@/lib/auth";
import { canAccessOps } from "@/lib/ops-access";
import { auditOpsWrite } from "@/lib/audit";
import { listZaloAccounts, listZaloGroupDirectory, setZaloGroupEnabled } from "@/lib/zalo-admin";

export const dynamic = "force-dynamic";

/**
 * GET  /api/v1/ops/zalo/groups?account=<id> — membership thật (directory) +
 * trạng thái bật + account nào đang sở hữu nhóm (cho bất biến 1-1).
 * POST { accountId, groupId, enabled } — bật/tắt; 409 kèm owner nếu xung đột.
 */
async function auth(req: Request): Promise<boolean> {
  const expected = process.env.OPS_API_TOKEN;
  const bearer = req.headers.get("authorization") ?? "";
  if (!!expected && bearer === `Bearer ${expected}`) return true;
  return canAccessOps(await getSessionUser());
}

export async function GET(req: Request) {
  if (!(await auth(req))) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const accountId = new URL(req.url).searchParams.get("account") ?? "default";
  const force = new URL(req.url).searchParams.get("refresh") === "1";
  try {
    const [directory, accounts] = await Promise.all([
      listZaloGroupDirectory(accountId, force),
      listZaloAccounts(),
    ]);
    const owner = new Map<string, string>();
    for (const a of accounts) for (const g of a.enabledGroups) owner.set(g, a.accountId);
    const me = accounts.find((a) => a.accountId === accountId);
    return NextResponse.json({
      accountId,
      groups: directory.map((g) => ({
        ...g,
        enabled: me?.enabledGroups.includes(g.groupId) ?? false,
        ownedBy: owner.get(g.groupId) ?? null, // ≠ accountId = vi phạm nếu bật
      })),
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "lỗi đọc directory" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  if (!(await auth(req))) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const body = (await req.json().catch(() => ({}))) as {
    accountId?: string;
    groupId?: string;
    enabled?: boolean;
  };
  if (!body.accountId || !body.groupId || typeof body.enabled !== "boolean") {
    return NextResponse.json({ error: "thiếu accountId/groupId/enabled" }, { status: 400 });
  }
  try {
    const { conflictWith } = await setZaloGroupEnabled(body.accountId, body.groupId, body.enabled);
    if (conflictWith) {
      return NextResponse.json(
        { error: `Nhóm đã bật ở tài khoản "${conflictWith}" (nguyên tắc 1 nhóm – 1 tài khoản)`, conflictWith },
        { status: 409 },
      );
    }
    auditOpsWrite("api:zalo-admin", "zalo.group.toggle", { accountId: body.accountId, groupId: body.groupId, enabled: body.enabled });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "lỗi ghi config" },
      { status: 400 },
    );
  }
}
