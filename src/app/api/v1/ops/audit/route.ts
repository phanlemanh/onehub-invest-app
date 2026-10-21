import { NextResponse } from "next/server";

import { getSessionUser } from "@/lib/auth";
import { isAdmin } from "@/lib/ops-access";
import { pool } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * GET /api/v1/ops/audit — 100 dòng ops:write gần nhất (C4 P3 DCA).
 * Admin-only: audit chứa cả thao tác machine token.
 */
export async function GET(req: Request) {
  const expected = process.env.OPS_API_TOKEN;
  const bearer = req.headers.get("authorization") ?? "";
  if (! (!!expected && bearer === `Bearer ${expected}`)) {
    const user = await getSessionUser();
    if (!isAdmin(user)) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
  }
  const { rows } = await pool.query(
    `SELECT at::text, actor, action, env, detail FROM ops_audit ORDER BY at DESC LIMIT 100`,
  );
  return NextResponse.json({ rows });
}
