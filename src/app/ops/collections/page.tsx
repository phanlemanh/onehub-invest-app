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
import { getSourceFeedHealth, getLockdownStatus } from "@/lib/ops-queries";

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
  const [days, funnel, jobs, rotation, zaloGroups, zaloAllowlist, zaloHealth, factsPushedAt, feedHealth, lockdown] = await Promise.all([
    getFlowDays(7),
    readGateFunnel(),
    readSchedulerStatus(),
    readRotationPreview(),
    getZaloGroups(),
    readZaloAllowlist(),
    readZaloHealth(),
    getFactsPushedAt(),
    getSourceFeedHealth(),
    getLockdownStatus(),
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

      {/* H3-P1: Sức khoẻ nguồn — liếc một phát biết kênh nào sống/chết/trễ SLO */}
      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-medium">Sức khỏe nguồn</h2>
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-muted-foreground border-b bg-muted/30 text-left">
                <th className="px-3 py-2 font-medium">Nguồn</th>
                <th className="px-2 py-2 font-medium">Trạng thái</th>
                <th className="px-2 py-2 font-medium">Chạy cuối</th>
                <th className="px-2 py-2 font-medium">Độ tươi</th>
                <th className="px-2 py-2 font-medium">24h</th>
                <th className="px-2 py-2 font-medium">Staging</th>
                <th className="px-3 py-2 font-medium">Offers</th>
              </tr>
            </thead>
            <tbody>
              {feedHealth.map((f) => {
                const overdue = f.sloHours && f.freshnessHrs !== null && f.freshnessHrs > f.sloHours;
                const dead = f.status !== "active";
                return (
                  <tr key={f.code} className="border-b last:border-0">
                    <td className="px-3 py-2">
                      <span className="font-mono">{f.code}</span> {f.labelVi}
                    </td>
                    <td className="px-2 py-2">
                      <Badge variant={dead ? "outline" : overdue ? "warning-light" : "success-light"}>
                        {dead ? f.status : overdue ? "trễ SLO" : "ok"}
                      </Badge>
                    </td>
                    <td className="text-muted-foreground px-2 py-2">
                      {f.lastRunAt ? new Date(f.lastRunAt).toLocaleString("vi-VN") : "—"}
                    </td>
                    <td className="px-2 py-2 tabular-nums">
                      {f.freshnessHrs === null ? "—" : `${f.freshnessHrs}h`}
                      {f.sloHours ? <span className="text-muted-foreground"> /{f.sloHours}h</span> : ""}
                    </td>
                    <td className="px-2 py-2 tabular-nums">{f.items24h || "—"}</td>
                    <td className="px-2 py-2 tabular-nums">{f.stgRows || "—"}</td>
                    <td className="px-3 py-2 tabular-nums">{f.offers ?? "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* H3-P2: Lockdown — sau 2 sự cố, an toàn phải hữu hình */}
      <section className="flex flex-col gap-2">
        <div className="flex items-baseline justify-between">
          <h2 className="text-sm font-medium">Lockdown &amp; hạ tầng thu</h2>
          <span className="text-muted-foreground text-[11px]">
            watchdog: {lockdown.lastWatchdogAt ?? "—"} · agent-turn hôm nay:{" "}
            <span className={lockdown.agentTurnsToday > 0 ? "font-semibold text-destructive" : ""}>
              {lockdown.agentTurnsToday}
            </span>
          </span>
        </div>
        <div className="grid grid-cols-2 gap-1.5 md:grid-cols-4">
          {lockdown.layers.map((l) => (
            <div
              key={l.layer + l.desc}
              className="flex items-center gap-2 rounded-md border px-2.5 py-1.5 text-xs"
            >
              <span
                className={`h-2 w-2 shrink-0 rounded-full ${
                  l.ok === true ? "bg-emerald-500" : l.ok === false ? "bg-red-500" : "bg-muted-foreground/40"
                }`}
              />
              <span className="truncate" title={l.desc}>
                <span className="text-muted-foreground">{l.layer}</span> {l.desc}
              </span>
            </div>
          ))}
        </div>
      </section>

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
