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

/**
 * /deals — G2: căn giá tốt nhất từ nguồn cộng đồng (price/m² thấp hơn median
 * phường). Liên hệ người đăng (PII) chỉ hiển thị ở máy local — trên cloud
 * stg_zalo_posts rỗng nên cột tự thiếu, đúng thiết kế tầng A.
 */
export default async function DealsPage() {
  const rows = await getDeals(30, 5);
  const hasContact = rows.some((r) => r.senderName);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <h1 className="text-xl font-medium">Căn giá tốt</h1>
        <p className="text-muted-foreground text-xs">
          Bán rẻ hơn median cùng phường (nguồn cộng đồng, 45 ngày gần nhất) —
          sắp theo mức chiết khấu. {hasContact ? "" : "Thông tin người đăng chỉ có ở máy thu (stg local)."}
        </p>
      </div>
      {rows.length === 0 ? (
        <p className="text-muted-foreground py-8 text-center text-sm">
          Chưa có căn nào dưới ngưỡng 5% so với median phường — dữ liệu cộng
          đồng đang tích luỹ.
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
              <div className="flex items-center gap-2 text-xs">
                <Link
                  prefetch={false}
                  href={d.areaPath ?? "/vn"}
                  className="text-primary font-medium hover:underline"
                >
                  {d.phuong ?? "—"}
                </Link>
                <span className="text-muted-foreground">
                  median {d.medianPerm2 ? `${fmtInt(d.medianPerm2 / 1e6)}tr/m²` : "—"}
                </span>
                {confBadge(d.confidence)}
              </div>
              {d.mediaPath && (
                // eslint-disable-next-line @next/next/no-img-element -- local staging file
                <img
                  src={`/api/zalo-media?path=${encodeURIComponent(d.mediaPath)}`}
                  alt={`Ảnh tin bán — ${d.phuong ?? ""}`}
                  className="h-36 w-full rounded-md object-cover"
                  loading="lazy"
                />
              )}
              {d.senderName && (
                <div className="flex items-center justify-between rounded-md bg-muted/50 px-2 py-1.5 text-xs">
                  <div className="flex flex-col">
                    <span className="font-medium">{d.senderName}</span>
                    <span className="text-muted-foreground">{d.groupName}</span>
                  </div>
                  <Link
                    prefetch={false}
                    href={`/vn?focus=${encodeURIComponent(d.offerId)}`}
                    className="text-primary hover:underline"
                  >
                    Chi tiết ↗
                  </Link>
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
