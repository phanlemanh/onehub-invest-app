import { MarketingNavbar } from "@/components/marketing/marketing-navbar";
import { SiteFooter } from "@/components/shell/site-footer";
import { getSessionUser } from "@/lib/auth";
import { getSearchIndex } from "@/lib/queries";

/** Invest Portal — trang marketing (trang chủ, phương pháp): navbar-12 + footer. */
export default async function MarketingLayout({ children }: { children: React.ReactNode }) {
  const [user, searchEntries] = await Promise.all([getSessionUser(), getSearchIndex()]);
  return (
    <div className="bg-background text-foreground flex min-h-svh w-full flex-col">
      <MarketingNavbar user={user} searchEntries={searchEntries} />
      <main className="flex flex-1 flex-col">{children}</main>
      <SiteFooter portal="invest" />
    </div>
  );
}
