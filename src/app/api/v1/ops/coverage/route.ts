import { NextResponse } from "next/server";

import { getSessionUser } from "@/lib/auth";
import { canAccessOps } from "@/lib/ops-access";
import { getCoverageOverview } from "@/lib/ops-queries";

export const dynamic = "force-dynamic";

/**
 * GET /api/v1/ops/coverage — bề mặt máy của /ops (ADR-0007 DCA).
 * Auth: session cookie HOẶC Authorization: Bearer <OPS_API_TOKEN>.
 * Trả mã SPL tầng B — không bao giờ tên nguồn thật (xem /ops/sources).
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
  const rows = await getCoverageOverview();
  return NextResponse.json({ generatedAt: new Date().toISOString(), rows });
}
