export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { LoginForm } from "@/components/auth/login-form";
import { getSessionUser } from "@/lib/auth";
import { safeNext } from "@/lib/safe-next";

export const metadata: Metadata = { title: "Đăng nhập" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string; mode?: string }>;
}) {
  const { error, next: rawNext, mode } = await searchParams;
  // ?next= do người ngoài đặt được: chỉ chuyển hướng trong site (sửa open redirect).
  const next = safeNext(rawNext);
  if (mode === "register") redirect(`/register?next=${encodeURIComponent(next)}`);
  const user = await getSessionUser();
  if (user) redirect(next);
  return <LoginForm next={next} error={error} />;
}
