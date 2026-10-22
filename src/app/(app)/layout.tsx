import { PortalShell } from "@/components/shell/portal-shell";
import { getSessionUser } from "@/lib/auth";
import { getSearchIndex } from "@/lib/queries";

/** Invest Portal — trang ứng dụng (Finder, Insight, Listing, Saved…). */
export default async function InvestAppLayout({ children }: LayoutProps<"/">) {
  const [user, searchEntries] = await Promise.all([getSessionUser(), getSearchIndex()]);
  return (
    <PortalShell portal="invest" user={user} searchEntries={searchEntries}>
      {children}
    </PortalShell>
  );
}
