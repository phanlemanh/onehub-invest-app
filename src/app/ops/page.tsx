import type { Metadata } from "next";

import { getCoverageOverview } from "@/lib/ops-queries";
import { sourceLabel } from "@/lib/source-labels";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Tổng quan vận hành" };

const STATUS_STYLE: Record<string, string> = {
  fresh: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  stale: "bg-red-500/15 text-red-600 dark:text-red-400",
  none: "bg-muted text-muted-foreground",
};
const STATUS_VI: Record<string, string> = { fresh: "Đạt", stale: "Quá hạn", none: "Chưa có" };

/** /ops — freshness SLO từng nguồn × city (ADR-0007 DQO + DCA: cùng dữ liệu với /api/v1/ops/coverage). */
export default async function OpsOverviewPage() {
  const rows = await getCoverageOverview();
  const stale = rows.filter((r) => r.status === "stale").length;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <h1 className="text-xl font-medium">Tổng quan vận hành</h1>
        <p className="text-muted-foreground text-xs">
          Độ tươi dữ liệu theo nguồn (mã SPL) và thị trường. SLO: S01 ≤ 8 ngày · S02 ≤ 35 ·
          S03 ≤ 3 · S04 ≤ 90. {stale > 0 && <span className="text-red-500">{stale} nguồn quá hạn.</span>}
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-muted-foreground border-b text-left">
              <th className="py-2 pr-4 font-medium">Mã</th>
              <th className="py-2 pr-4 font-medium">Vai trò</th>
              <th className="py-2 pr-4 font-medium">Thị trường</th>
              <th className="py-2 pr-4 font-medium">Snapshot cuối</th>
              <th className="py-2 pr-4 font-medium">Tuổi (ngày)</th>
              <th className="py-2 pr-4 font-medium">SLO</th>
              <th className="py-2 font-medium">Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={`${r.code}-${r.city}`} className="border-b last:border-0">
                <td className="py-2 pr-4 font-mono">{r.code}</td>
                <td className="py-2 pr-4">{sourceLabel(r.code).vi}</td>
                <td className="py-2 pr-4">{r.city}</td>
                <td className="py-2 pr-4">{r.lastSnapshotAt?.slice(0, 10) ?? "—"}</td>
                <td className="py-2 pr-4">{r.ageDays ?? "—"}</td>
                <td className="py-2 pr-4">{r.sloDays}</td>
                <td className="py-2">
                  <span className={`rounded px-1.5 py-0.5 font-medium ${STATUS_STYLE[r.status]}`}>
                    {STATUS_VI[r.status]}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
