import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { pool } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { isAdmin } from "@/lib/ops-access";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Nguồn dữ liệu" };

type RegistryRow = {
  code: string;
  real_name: string;
  label_vi: string;
  status: string;
  since: string;
  retired_at: string | null;
};

/**
 * /ops/sources — SPL: bảng giải mã mã↔tên thật (tầng A). Clearance law
 * (portals.md + ADR-0007): CHỈ role=admin. Trang này là nơi duy nhất tên
 * nguồn thật xuất hiện trên UI.
 */
export default async function OpsSourcesPage() {
  const user = await getSessionUser();
  if (!isAdmin(user)) notFound();

  const { rows } = await pool.query<RegistryRow>(
    `SELECT code, real_name, label_vi, status, since::text, retired_at::text
     FROM source_registry ORDER BY code`,
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <h1 className="text-xl font-medium">Nguồn dữ liệu</h1>
        <p className="text-muted-foreground text-xs">
          Registry mã nguồn (SPL) + quản trị nguồn (IA Ops nguyên tắc 2: quan sát ở
          Thu thập, quản trị ở đây). Mã retired không tái sử dụng; đổi nhãn công khai
          phải qua mini-ADR. Nội bộ admin — không sync cloud.
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-muted-foreground border-b text-left">
              <th className="py-2 pr-4 font-medium">Mã</th>
              <th className="py-2 pr-4 font-medium">Tên thật (tầng A)</th>
              <th className="py-2 pr-4 font-medium">Nhãn hiển thị (tầng C)</th>
              <th className="py-2 pr-4 font-medium">Trạng thái</th>
              <th className="py-2 pr-4 font-medium">Từ</th>
              <th className="py-2 font-medium">Retired</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.code} className="border-b last:border-0">
                <td className="py-2 pr-4 font-mono">{r.code}</td>
                <td className="py-2 pr-4 font-mono">{r.real_name}</td>
                <td className="py-2 pr-4">{r.label_vi}</td>
                <td className="py-2 pr-4">{r.status}</td>
                <td className="py-2 pr-4">{r.since}</td>
                <td className="py-2">{r.retired_at ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
