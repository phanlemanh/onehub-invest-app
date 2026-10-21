export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { RegisterForm } from "@/components/auth/register-form";
import { getSessionUser } from "@/lib/auth";
import { fmtInt } from "@/lib/format";
import { getFinderAreas } from "@/lib/queries";
import { safeNext } from "@/lib/safe-next";

export const metadata: Metadata = { title: "Đăng ký" };

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const { error, next: rawNext } = await searchParams;
  const next = safeNext(rawNext);
  const user = await getSessionUser();
  if (user) redirect(next);
  const markets = await getFinderAreas({ country: "vn" }, { geometry: false });
  const listings = markets.reduce((sum, m) => sum + m.listings, 0);
  return (
    <RegisterForm
      next={next}
      error={error}
      facts={[`${fmtInt(markets.length)} thị trường Việt Nam`, `${fmtInt(listings)} listing tự thu`]}
    />
  );
}
