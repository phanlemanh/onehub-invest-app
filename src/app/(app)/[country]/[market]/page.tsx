export const dynamic = "force-dynamic";

import type { Metadata } from "next";

import { InsightPage } from "@/components/insight/insight-page";
import { getArea } from "@/lib/queries";

type Params = Promise<{ country: string; market: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { country, market } = await params;
  const area = await getArea(`${country}-${market}`);
  return { title: area ? `${area.name} — Insight thị trường` : "Không tìm thấy" };
}

export default async function MarketPage({ params }: { params: Params }) {
  const { country, market } = await params;
  return <InsightPage areaId={`${country}-${market}`} />;
}
