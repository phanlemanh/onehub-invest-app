import { NextResponse } from "next/server";

import { pool } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { canAccessOps } from "@/lib/ops-access";

export const dynamic = "force-dynamic";

type Row = { entity: string; checked_at: string; detail: string };

/**
 * GET /api/v1/ops/extraction-quality — F1 extractor (regex/llm) từ
 * dq_check_results do bench-extraction ghi (ADR-0007 DCA + DQO).
 * Auth như coverage route: bearer OPS_API_TOKEN hoặc session ops.
 */
export async function GET(req: Request) {
  const expected = process.env.OPS_API_TOKEN;
  const bearer = req.headers.get("authorization") ?? "";
  const bearerOk = !!expected && bearer === `Bearer ${expected}`;
  if (!bearerOk) {
    const user = await getSessionUser();
    if (!canAccessOps(user)) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
  }
  const { rows } = await pool.query<Row>(
    `SELECT DISTINCT ON (entity) entity, checked_at::text, detail
     FROM dq_check_results WHERE check_name = 'extraction-quality'
     ORDER BY entity, checked_at DESC`,
  );
  return NextResponse.json({
    generatedAt: new Date().toISOString(),
    results: rows.map((r) => {
      const f1: Record<string, number> = {};
      for (const m of r.detail.matchAll(/(\w+)=([\d.]+)/g)) {
        if (m[1] !== "samples") f1[m[1]] = Number(m[2]);
      }
      const fields = Object.keys(f1).filter((k) => k !== "avgF1");
      const samples = Number(r.detail.match(/samples=(\d+)/)?.[1] ?? 0);
      const f1ByField = Object.fromEntries(fields.map((k) => [k, f1[k]]));
      return {
        extractor: r.entity,
        f1ByField: samples > 0 ? f1ByField : {},
        f1Avg: samples > 0 ? (f1.avgF1 ?? null) : null,
        samples,
        checkedAt: r.checked_at,
      };
    }),
  });
}
