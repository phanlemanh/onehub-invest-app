export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { InsightPage } from "@/components/insight/insight-page";
import { getArea, resolveSubmarketId } from "@/lib/queries";

type Params = Promise<{ country: string; market: string; submarket: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { country, market, submarket } = await params;
  const areaId = await resolveSubmarketId(`${country}-${market}`, submarket);
  const area = areaId ? await getArea(areaId) : null;
  return {
    title: area ? `${area.name}, ${area.parentName ?? ""} — Insight phường` : "Không tìm thấy",
  };
}

export default async function SubmarketPage({ params }: { params: Params }) {
  const { country, market, submarket } = await params;
  const areaId = await resolveSubmarketId(`${country}-${market}`, submarket);
  if (!areaId) notFound();
  return <InsightPage areaId={areaId} />;
}
