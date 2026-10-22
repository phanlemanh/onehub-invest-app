import type { Metadata } from "next";
import Link from "next/link";

import { Badge } from "@/components/reui/badge";
import { getDeals } from "@/lib/deals";
import { fmtInt, fmtMoney } from "@/lib/format";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Căn giá tốt" };

function fmtPrice(v: number | null) {
  if (v === null) return "—";
  if (v >= 1e9) return `${(v / 1e9).toFixed(v % 1e9 === 0 ? 0 : 1)} tỷ`;
  if (v >= 1e6) return `${(v / 1e6).toFixed(0)}tr`;
  return fmtInt(v);
}

function confBadge(c: string) {
  if (c === "high") return <Badge variant="success-light">tin cậy cao</Badge>;
  if (c === "medium") return <Badge variant="outline">trung bình</Badge>;
  return <Badge variant="warning-light">thấp</Badge>;
}

function sourceBadge(s: string) {
  if (s === "S03") return <Badge variant="outline">Zalo</Badge>;
  if (s === "S05") return <Badge variant="outline">Facebook</Badge>;
  return <Badge variant="outline">{s}</Badge>;
}

function fmtPhone(p: string) {
  // 0973034567 → 0973 034 567 — dễ đọc khi gọi
  return p.replace(/^(\d{4})(\d{3})(\d{3})$/, "$1 $2 $3");
}

/**
 * /deals — P4: căn giá tốt từ tín hiệu riêng (P1: Zalo/Facebook) đo bằng
 * thước vải công khai (P2: median Chợ Tốt cùng phường). SĐT người bán là
 * PII tầng A — bảng sale_offers không sync cloud nên chỉ máy local có.
 */
export default async function DealsPage() {
  const rows = await getDeals(30, 5);
  const hasContact = rows.some((r) => r.sellerPhone);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <h1 className="text-xl font-medium">Căn giá tốt</h1>
        <p className="text-muted-foreground text-xs">
          Tin nội bộ (Zalo/Facebook) rẻ hơn median rao công khai cùng phường
          (thước Chợ Tốt, ≥5 tin/phường, 45 ngày gần nhất). {hasContact
            ? "SĐT người đăng hiện sẵn — gọi xác minh giá thật."
            : "Thông tin người đăng chỉ có ở máy thu (local)."}
        </p>
      </div>
      {rows.length === 0 ? (
        <p className="text-muted-foreground py-8 text-center text-sm">
          Chưa có căn nào dưới ngưỡng 5% so với thước phường — vải công khai
          đang tích luỹ (quét 05:30 hằng ngày).
        </p>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {rows.map((d) => (
            <div key={d.offerId} className="flex flex-col gap-2 rounded-xl border p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex flex-col">
                  <span className="text-lg font-semibold tabular-nums">
                    {fmtPrice(d.priceVnd)}
                  </span>
                  <span className="text-muted-foreground text-xs">
                    {d.areaM2 ? `${fmtInt(d.areaM2)} m²` : "—"}
                    {d.bedrooms ? ` · ${d.bedrooms}PN` : ""} ·{" "}
                    {d.pricePerm2 ? `${fmtInt(d.pricePerm2 / 1e6)}tr/m²` : "—"}
                  </span>
                </div>
                <Badge variant="success-light" className="tabular-nums text-sm">
                  −{d.discountPct?.toFixed(0)}%
                </Badge>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs">
                {sourceBadge(d.source)}
                <Link
                  prefetch={false}
                  href={d.areaPath ?? "/vn"}
                  className="text-primary font-medium hover:underline"
                >
                  {d.phuong ?? "—"}
                </Link>
                <span className="text-muted-foreground">
                  thước {d.medianPerm2 ? `${fmtInt(d.medianPerm2 / 1e6)}tr/m²` : "—"}
                  {d.rulerN ? ` (n=${d.rulerN})` : ""}
                </span>
                {confBadge(d.confidence)}
              </div>
              {(d.mediaPath || d.mediaUrl) && (
                // eslint-disable-next-line @next/next/no-img-element -- Ảnh local (Zalo path) hoặc CDN (FB url)
                <img
                  src={
                    d.mediaPath
                      ? `/api/zalo-media?path=${encodeURIComponent(d.mediaPath)}`
                      : (d.mediaUrl ?? "")
                  }
                  alt={`Ảnh tin bán — ${d.phuong ?? ""}`}
                  className="h-36 w-full rounded-md object-cover"
                  loading="lazy"
                />
              )}
              {(d.sellerPhone || d.sellerName) && (
                <div className="flex items-center justify-between gap-2 rounded-md bg-muted/50 px-2 py-1.5 text-xs">
                  <div className="flex min-w-0 flex-col">
                    <span className="truncate font-medium">
                      {d.sellerName ?? "Người đăng"}
                      {d.brokerNAds && d.brokerNAds > 1 && (
                        <span className="text-muted-foreground font-normal">
                          {" "}· {d.brokerNAds} tin
                          {d.brokerMedianGap !== null
                            ? ` · gap giữa ${d.brokerMedianGap.toFixed(0)}%`
                            : ""}
                        </span>
                      )}
                    </span>
                    <span className="text-muted-foreground truncate">
                      {d.groupName}
                    </span>
                  </div>
                  {d.sellerPhone && (
                    <a
                      href={`tel:${d.sellerPhone}`}
                      className="shrink-0 rounded-md bg-primary px-2 py-1 font-medium text-primary-foreground"
                    >
                      ☎ {fmtPhone(d.sellerPhone)}
                    </a>
                  )}
                </div>
              )}
              {d.postText && (
                <p className="text-muted-foreground line-clamp-2 text-xs">{d.postText}</p>
              )}
              <p className="text-muted-foreground text-[10px]">
                thấy {d.firstSeen.slice(0, 10)} · {d.nReposts > 1 ? `đăng ${d.nReposts} lần` : "mới"}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
