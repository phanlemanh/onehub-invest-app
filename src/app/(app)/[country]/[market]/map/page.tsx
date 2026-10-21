import { redirect } from "next/navigation";

/** Bản đồ đã gộp vào Finder (IA §3): giữ link cũ bằng redirect. */
export default async function LegacyMapPage({
  params,
}: {
  params: Promise<{ country: string; market: string }>;
}) {
  const { country, market } = await params;
  redirect(`/${country}?level=submarket&market=${encodeURIComponent(market)}&view=map`);
}
