import { NextResponse } from "next/server";

import { getSessionUser } from "@/lib/auth";
import { canAccessOps } from "@/lib/ops-access";
import {
  getFlowDays,
  getZaloAccountsFromFacts,
  getZaloGroups,
  readGateFunnel,
  readRotationPreview,
  readSchedulerStatus,
  readZaloAllowlist,
  readZaloHealth,
} from "@/lib/collections-queries";

export const dynamic = "force-dynamic";

/**
 * GET /api/v1/ops/collections — bề mặt máy của trang "Thu thập" (ADR-0007
 * DCA). Auth như các route ops khác: session cookie HOẶC Bearer
 * <OPS_API_TOKEN>. Query: ?days=7 (tối đa 90).
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
  const days = Math.min(
    90,
    Math.max(1, Number(new URL(req.url).searchParams.get("days") ?? 7) || 7),
  );
  const [flow, funnel, jobs, rotation, zaloGroups, zaloAllowlist, zaloHealth, zaloAccounts] = await Promise.all([
    getFlowDays(days),
    readGateFunnel(),
    readSchedulerStatus(),
    readRotationPreview(),
    getZaloGroups(),
    readZaloAllowlist(),
    readZaloHealth(),
    getZaloAccountsFromFacts(),
  ]);
  return NextResponse.json({
    generatedAt: new Date().toISOString(),
    flow,
    funnel,
    jobs,
    rotation,
    zaloGroups,
    zaloAllowlist,
    zaloHealth,
    zaloAccounts,
  });
}
