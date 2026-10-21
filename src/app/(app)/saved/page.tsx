export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { SavedList } from "@/components/saved/saved-list";
import type { SavedArea } from "@/components/saved/saved-item";
import { getSavedAreas, getSessionUser } from "@/lib/auth";
import { currencyFor, getFinderAreas } from "@/lib/queries";

export const metadata: Metadata = { title: "Đã lưu" };

/** Khu vực đã lưu (IA §3.2) — wishlist-2 chuyển thể, số liệu cùng nguồn Finder. */
export default async function SavedPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login?next=/saved");

  const saved = await getSavedAreas(user.id);
  const metrics = new Map(
    (await getFinderAreas({ ids: saved.map((s) => s.id) }, { geometry: false })).map((r) => [r.id, r]),
  );
  const areas: SavedArea[] = saved.map((s) => {
    const m = metrics.get(s.id);
    return {
      id: s.id,
      name: s.name,
      parentName: m?.parentName ?? null,
      regionType: s.regionType === "market" ? "market" : "submarket",
      href: m?.href ?? s.href,
      savedAt: s.savedAt,
      listings: m?.listings ?? null,
      revpar: m?.revpar ?? null,
      occupancy: m?.occupancy ?? null,
      adr: m?.adr ?? null,
      currency: currencyFor(s.id),
    };
  });

  return <SavedList areas={areas} email={user.email} />;
}
