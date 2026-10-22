import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { InvestmentSimulator } from "@/components/invest/investment-simulator";
import { getArea } from "@/lib/queries";
import { getInvestmentDefaults } from "@/lib/invest";

type Params = { params: Promise<{ country: string; market: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { country, market } = await params;
  const area = await getArea(`${country}-${market}`);
  return { title: area ? `Mô phỏng đầu tư · ${area.name}` : "Mô phỏng đầu tư" };
}

/**
 * /[country]/[market]/dau-tu — G3: máy tính dòng tiền đầu tư (giai đoạn 3
 * của pipeline 4 giai đoạn). Defaults từ dữ liệu thật: giá bán + thuê LTR
 * = vải P2 Chợ Tốt; ADR + công suất = AirDNA (hiệu chuẩn). Người dùng
 * chỉnh mọi thông số — tính client-side.
 */
export default async function InvestmentPage({ params }: Params) {
  const { country, market } = await params;
  const areaId = `${country}-${market}`;
  const area = await getArea(areaId);
  if (!area) notFound();
  const defaults = await getInvestmentDefaults(areaId);
  if (!defaults) notFound();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <h1 className="text-xl font-medium">Mô phỏng đầu tư · {area.name}</h1>
        <p className="text-muted-foreground text-xs">
          Dòng tiền hai chế độ thuê (ngắn hạn Airbnb / dài hạn) với vốn vay —
          con số mặc định kéo từ dữ liệu thị trường (vải Chợ Tốt, hiệu chuẩn
          AirDNA{defaults.adrPeriod ? ` kỳ ${defaults.adrPeriod}` : ""}); chỉnh
          thoải mái, kết quả tính tức thời.
        </p>
      </div>
      <InvestmentSimulator defaults={defaults} />
    </div>
  );
}
