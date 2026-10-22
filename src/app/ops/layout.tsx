import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { PortalShell } from "@/components/shell/portal-shell";
import { getSessionUser } from "@/lib/auth";
import { canAccessOps } from "@/lib/ops-access";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { default: "Vận hành", template: "%s · Vận hành · One Invest" },
  robots: { index: false, follow: false },
};

/**
 * Ops Portal. proxy.ts chặn sớm khi thiếu cookie; đây là kiểm tra thật
 * (session còn hạn + quyền). Shell tạm dùng chung PortalShell với cấu hình
 * nav "ops" — đổi sang @reui/app-shell-26 khi có trang ops thật.
 */
export default async function OpsLayout({ children }: LayoutProps<"/ops">) {
  const user = await getSessionUser();
  if (!user) redirect("/login?next=/ops");
  if (!canAccessOps(user)) notFound();
  return (
    <PortalShell portal="ops" user={user} searchEntries={[]}>
      {children}
    </PortalShell>
  );
}
