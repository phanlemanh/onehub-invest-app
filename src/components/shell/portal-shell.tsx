import type { ReactNode } from "react"

import type { SearchEntry } from "@/lib/queries"
import type { ShellUser } from "./account-menu"
import type { Portal } from "./nav"
import { SiteFooter } from "./site-footer"
import { TopBar } from "./top-bar"

/**
 * Khung chung cho mọi cổng, chuyển thể từ @reui/app-shell-30 (top nav, không
 * sidebar). Khác bản gốc: cuộn theo window (để Next giữ vị trí cuộn khi điều
 * hướng) thay vì một vùng overflow riêng; section suy từ URL thay vì state.
 */
export function PortalShell({
  portal,
  user,
  searchEntries,
  children,
}: {
  portal: Portal
  user: ShellUser | null
  searchEntries: SearchEntry[]
  children: ReactNode
}) {
  return (
    <div className="bg-background text-foreground flex min-h-svh w-full flex-col">
      <TopBar portal={portal} user={user} searchEntries={searchEntries} />
      {/* Page panel viền mờ của app-shell-30. */}
      <div className="inset-ring-ring/20 flex min-h-0 flex-1 flex-col rounded-t-xl inset-ring">
        <div className="flex flex-1 flex-col px-4 py-4 sm:px-6 sm:py-6">{children}</div>
      </div>
      <SiteFooter portal={portal} />
    </div>
  )
}
