import { NextResponse } from "next/server";

import { getSessionUser } from "@/lib/auth";
import { canAccessOps } from "@/lib/ops-access";
import { getTruthfulCoverage } from "@/lib/queries";

export const dynamic = "force-dynamic";

/**
 * GET /api/v1/ops/truthful-coverage — bề mặt máy của thẻ "Độ phủ trung thực"
 * (E2 C2/D, ADR-0007 DCA). Auth như các route ops khác: session cookie HOẶC
 * Bearer <OPS_API_TOKEN>.
 *
 * ratio = listing tự thu ÷ listing active AirDNA (mẫu hiệu chuẩn, không phải
 * độ phủ quét thị trường).
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
  const rows = await getTruthfulCoverage();
  return NextResponse.json({ generatedAt: new Date().toISOString(), rows });
}
