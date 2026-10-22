import { NextResponse } from "next/server";

import { auditOpsWrite } from "@/lib/audit";
import { pool } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { canAccessOps } from "@/lib/ops-access";

export const dynamic = "force-dynamic";

/**
 * POST /api/v1/ops/ingest — C4 P2: máy thu đẩy "local facts" (ống Zalo,
 * máy móc launchd, funnel, rotation, nhóm) lên cloud để Ops Portal trên
 * Vercel đầy đủ 3 tầng. Idempotent: upsert một dòng ops_heartbeat.
 * Auth: Bearer <OPS_API_TOKEN> (token cloud riêng) HOẶC session ops.
 */
export async function POST(req: Request) {
  const expected = process.env.OPS_API_TOKEN;
  const bearer = req.headers.get("authorization") ?? "";
  const bearerOk = !!expected && bearer === `Bearer ${expected}`;
  if (!bearerOk) {
    const user = await getSessionUser();
    if (!canAccessOps(user)) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
  }
  const payload = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!payload || typeof payload !== "object" || !payload.pushedAt) {
    return NextResponse.json({ error: "payload thiếu pushedAt" }, { status: 400 });
  }
  await pool.query(
    `INSERT INTO ops_heartbeat (id, payload, pushed_at)
     VALUES ('primary', $1::jsonb, $2)
     ON CONFLICT (id) DO UPDATE SET payload = EXCLUDED.payload, pushed_at = EXCLUDED.pushed_at`,
    [JSON.stringify(payload), new Date(payload.pushedAt as string)],
  );
  auditOpsWrite("machine:cloud-sync", "ops.ingest", { pushedAt: payload.pushedAt });
  return NextResponse.json({ ok: true, pushedAt: payload.pushedAt });
}
