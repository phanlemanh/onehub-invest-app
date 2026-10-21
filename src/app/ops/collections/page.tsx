import type { Metadata } from "next";

import { Badge } from "@/components/reui/badge";
import Link from "next/link";

import { FlowTable, SchedulerTable, ZaloGroupsTable } from "@/components/ops/collections-tables";
import {
  getFlowDays,
  getFactsPushedAt,
  readGateFunnel,
  readRotationPreview,
  readSchedulerStatus,
  readZaloAllowlist,
  readZaloHealth,
  getZaloGroups,
} from "@/lib/collections-queries";
import { fmtInt } from "@/lib/format";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Thu thập" };

function Stat({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-muted-foreground text-xs">{label}</span>
      <span className="text-2xl font-semibold tabular-nums">{value}</span>
      {sub ? <span className="text-muted-foreground text-xs">{sub}</span> : null}
    </div>
  )
}

/**
 * /ops/collections "Thu Thập" — dòng chảy dữ liệu thu thập (portals.md).
 * Trả lời 3 câu: hôm nay chảy vào gì / qua cổng nào / máy có chạy không.
 */
export default async function CollectionsPage() {
  const [days, funnel, jobs, rotation, zaloGroups, zaloAllowlist, zaloHealth, factsPushedAt] = await Promise.all([
    getFlowDays(7),
    readGateFunnel(),
    readSchedulerStatus(),
    readRotationPreview(),
    getZaloGroups(),
    readZaloAllowlist(),
    readZaloHealth(),
    getFactsPushedAt(),
  ]);
  const today = days[0];
  const factsAgeMin = factsPushedAt
    ? Math.round((Date.now() - new Date(factsPushedAt).getTime()) / 60000)
    : null;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <h1 className="text-xl font-medium">Thu thập</h1>
        <p className="text-muted-foreground text-xs">
          Dòng chảy dữ liệu vào hệ thống theo nguồn và theo ngày — cho ra quyết
          định thu thập mà không phải mở log tay.
        </p>
        {factsPushedAt && (
          <Badge variant={factsAgeMin !== null && factsAgeMin > 30 ? "warning-light" : "outline"}>
            Dữ liệu máy thu — cập nhật {factsAgeMin !== null ? `${factsAgeMin} phút` : ""} trước
            {factsAgeMin !== null && factsAgeMin > 30 ? " (máy thu offline?)" : ""}
          </Badge>
        )}
      </div>

      {/* Hôm nay — 3 nguồn + cổng gate */}
      <section className="rounded-xl border p-4">
        <div className="mb-3 flex items-center gap-2">
          <h2 className="font-medium">Hôm nay · {today?.day ?? ""}</h2>
          <Badge variant="outline">giờ máy</Badge>
        </div>
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          <Stat
            label="AirDNA — market thu"
            value={fmtInt(today?.airdnaMarkets ?? 0)}
            sub={`${fmtInt(today?.airdnaListings ?? 0)} listing LTM chạm`}
          />
          <Stat
            label="Airbnb — listing tươi"
            value={fmtInt(today?.airbnbListingsSeen ?? 0)}
            sub={`${fmtInt(today?.airbnbSnapshots ?? 0)} snapshot`}
          />
          <Stat
            label="Zalo — post qua gate"
            value={fmtInt(funnel.today.passed)}
            sub={`${fmtInt(funnel.today.messages)} tin thấy · ${fmtInt(funnel.today.skipped)} bị cổng chặn`}
          />
          <Stat
            label="Zalo — offer vào DB"
            value={fmtInt(today?.zaloOffers ?? 0)}
            sub={`${fmtInt(today?.zaloPosts ?? 0)} post raw`}
          />
        </div>
        <p className="text-muted-foreground mt-3 text-xs">
          Cổng Kev: sự kiện cuối {funnel.lastEventAt ?? "—"}. 7 ngày qua:{" "}
          {fmtInt(funnel.last7.messages)} tin thấy → {fmtInt(funnel.last7.passed)} qua cổng →{" "}
          {fmtInt(funnel.last7.accepted)} nhận vào raw
          {funnel.last7.media > 0 ? ` · ${fmtInt(funnel.last7.media)} media-only` : ""}.
        </p>
      </section>

      {/* Ống Zalo — tầng Ống V2 */}
      <section className="rounded-xl border p-4">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <h2 className="font-medium">Ống Zalo</h2>
          {zaloHealth.connected === null ? (
            <Badge variant="outline">Chưa có heartbeat</Badge>
          ) : zaloHealth.connected ? (
            <Badge variant="success-light">Channel kết nối</Badge>
          ) : (
            <Badge variant="warning-light">Channel ĐỨT — cần `openclaw channels login --channel zalouser`</Badge>
          )}
          {zaloHealth.uptime24h !== null && (
            <Badge variant="outline">uptime 24h {(zaloHealth.uptime24h * 100).toFixed(0)}%</Badge>
          )}
          {zaloHealth.silentAlert24h && (
            <Badge variant="warning-light">Cảnh báo im lặng 24h</Badge>
          )}
          {zaloHealth.driftAlert24h && (
            <Badge variant="warning-light">Allowlist lệch membership — xem /ops/sources</Badge>
          )}
        </div>
        <p className="text-muted-foreground text-xs">
          Heartbeat 15′ cuối{" "}
          {zaloHealth.heartbeatAgeMin === null
            ? "—"
            : `${zaloHealth.heartbeatAgeMin}′ trước`}
          {zaloHealth.heartbeatAgeMin !== null && zaloHealth.heartbeatAgeMin > 20
            ? " (probe trễ — kiểm tra launchd zalo-heartbeat)"
            : ""}
          {" · tin cuối qua cổng "}
          {zaloHealth.lastPostAt
            ? `${Math.round((Date.now() - new Date(zaloHealth.lastPostAt).getTime()) / 3600000)}h trước`
            : "chưa có"}
          .
        </p>
      </section>

      {/* Rotation kế tiếp */}
      <section className="rounded-xl border p-4">
        <div className="mb-2 flex items-center gap-2">
          <h2 className="font-medium">Rotation AirDNA kế tiếp</h2>
          <Badge variant="outline">
            {rotation.total} market · con trỏ {rotation.cursor}
            {rotation.updatedAt ? ` · cập nhật ${rotation.updatedAt.slice(0, 16).replace("T", " ")}` : " · chưa chạy đêm nào"}
          </Badge>
        </div>
        {rotation.next.length > 0 ? (
          <ul className="flex flex-wrap gap-2">
            {rotation.next.map((m) => (
              <li key={m.id} className="rounded-md border px-2 py-1 text-sm">
                {m.name}
                <span className="text-muted-foreground ml-1 text-xs">
                  #{m.id}
                  {m.lastCapturedAt ? "" : " · chưa thu lần nào"}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground text-sm">
            Không còn market nào cần thu — mọi thị trường đều tươi trong 24h.
          </p>
        )}
        <p className="text-muted-foreground mt-2 text-xs">
          6 market/đêm lúc 19:05, bỏ qua market thu trong 24h — một vòng toàn quốc
          ~6-7 đêm.
        </p>
      </section>

      <FlowTable days={days} />
      <ZaloGroupsTable rows={zaloGroups} allowlist={zaloAllowlist} />
      <p className="text-muted-foreground -mt-3 text-xs">
        Thêm tài khoản / bật-tắt nhóm (quản trị nguồn):{" "}
        <Link prefetch={false} href="/ops/sources" className="font-medium underline">
          Nguồn dữ liệu
        </Link>{" "}
        — admin, nguyên tắc 1 nhóm – 1 tài khoản.
      </p>

      <SchedulerTable jobs={jobs} />
    </div>
  )
}
