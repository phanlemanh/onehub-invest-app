export const dynamic = "force-dynamic";

import Link from "next/link";

import { FaqSection, type FaqItem } from "@/components/marketing/faq-section";
import { Hero } from "@/components/marketing/hero";
import { HowItWorks } from "@/components/marketing/how-it-works";
import { MarketCards } from "@/components/marketing/market-cards";
import { Button } from "@/components/ui/button";
import { fmtInt } from "@/lib/format";
import { currencyFor, getFinderAreas, getSearchIndex } from "@/lib/queries";

const FAQ: FaqItem[] = [
  {
    id: "nguon",
    question: "Số liệu lấy từ đâu?",
    answer:
      "Từ lịch đặt phòng Airbnb do chúng tôi tự thu thập (Hà Nội, TP. Hồ Chí Minh). Listing được gán vào phường theo toạ độ trên ranh giới OpenStreetMap.",
  },
  {
    id: "lich",
    question: "Vì sao công suất các tháng xa lại thấp?",
    answer:
      "Vì số liệu là lịch đặt của các tháng tới: tháng xa khách chưa đặt tới. Đó là đặc điểm của dữ liệu, không phải dấu hiệu thị trường yếu.",
  },
  {
    id: "loi-suat",
    question: "Ước tính lợi suất có đáng tin không?",
    answer:
      "Mỗi ước tính đi kèm độ tin cậy (số listing so sánh, độ phân tán giá) và khoảng p25–p75. Giá bán và giá thuê dài hạn hiện là dữ liệu mô phỏng — có nhãn rõ ràng.",
  },
  {
    id: "mien-phi",
    question: "Có mất phí không?",
    answer: "Không. Tài khoản miễn phí dùng để lưu thị trường và phường.",
  },
];

/** Trang chủ (IA §3.2): hero-8, card-29, how-it-works-1, faq-6 — mọi số là số thật. */
export default async function HomePage() {
  const [vn, th, entries] = await Promise.all([
    getFinderAreas({ country: "vn" }, { geometry: false }),
    getFinderAreas({ country: "th" }, { geometry: false }),
    getSearchIndex(),
  ]);
  const markets = [...vn, ...th].sort((a, b) => b.listings - a.listings);
  const lead = [...vn].sort((a, b) => b.listings - a.listings)[0];
  const leadAreas = lead ? await getFinderAreas({ marketId: lead.id }, { geometry: false }) : [];
  const topAreas = leadAreas
    .filter((a) => a.listings >= 5 && a.revpar)
    .sort((a, b) => (b.revpar ?? 0) - (a.revpar ?? 0))
    .slice(0, 4);
  const vnListings = vn.reduce((sum, m) => sum + m.listings, 0);
  const wards = entries.filter((e) => e.kind === "submarket" && e.id.startsWith("vn-")).length;

  return (
    <div className="flex flex-col">
      <Hero
        entries={entries}
        proofPoints={[
          `${fmtInt(vnListings)} listing Airbnb tại Việt Nam đang theo dõi`,
          `${fmtInt(wards)} phường/xã ở ${vn.map((m) => m.name).join(" và ")}`,
        ]}
        preview={lead ? { market: lead, topAreas, currency: currencyFor(lead.id) } : null}
      />

      <section aria-labelledby="markets-title" className="w-full px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div className="flex flex-col gap-2">
              <h2 id="markets-title" className="text-3xl font-semibold tracking-tight">
                Thị trường đang theo dõi
              </h2>
              <p className="text-muted-foreground text-base">RevPAR và công suất trên lịch đặt các tháng tới.</p>
            </div>
            <Button variant="outline" nativeButton={false} render={<Link href="/vn" />}>
              Xem bảng xếp hạng
            </Button>
          </div>
          <MarketCards markets={markets.map((m) => ({ ...m, currency: currencyFor(m.id) }))} />
        </div>
      </section>

      <HowItWorks />

      <div className="px-4 py-12 sm:px-6">
        <FaqSection
          id="hoi-dap"
          title="Câu hỏi thường gặp"
          items={FAQ}
          defaultOpen="nguon"
          footer={{
            title: "Muốn biết chi tiết công thức?",
            text: "Mọi chỉ số, mô hình lợi suất và giới hạn dữ liệu đều ở trang Phương pháp.",
            actions: (
              <Button size="sm" nativeButton={false} render={<Link href="/phuong-phap" />}>
                Đọc phương pháp
              </Button>
            ),
          }}
        />
      </div>
    </div>
  );
}
