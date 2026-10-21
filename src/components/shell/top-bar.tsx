"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { MenuIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"
import type { SearchEntry } from "@/lib/queries"
import { cn } from "@/lib/utils"
import { AccountMenu, type ShellUser } from "./account-menu"
import { BrandMark } from "./brand-mark"
import { NAV_SECTIONS, PORTAL_HOME, type Portal } from "./nav"
import { SearchCommand } from "./search-command"

// Style constants giữ nguyên từ top-bar của @reui/app-shell-30.
const NAV_ITEM = "gap-2 px-2 text-xs"
const MENU_ITEM = "data-highlighted:bg-accent/50 pr-1.5"
const NAV_ACTIVE = "bg-accent dark:bg-input/50 text-foreground"
const NAV_RESTING =
  "text-muted-foreground hover:bg-accent/50 [&_svg]:text-ring [&_svg]:transition-colors hover:text-foreground hover:[&_svg]:text-foreground"

interface TopBarProps {
  portal: Portal
  user: ShellUser | null
  searchEntries: SearchEntry[]
}

export function TopBar({ portal, user, searchEntries }: TopBarProps) {
  const pathname = usePathname()
  const sections = NAV_SECTIONS[portal]

  return (
    <header className="flex w-full shrink-0 items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-4">
      <div className="flex min-w-0 items-center gap-2 lg:gap-4">
        <BrandMark
          href={PORTAL_HOME[portal]}
          label={portal === "ops" ? "Vận hành" : undefined}
        />
        <Separator
          orientation="vertical"
          className="h-3.5 data-vertical:self-center max-lg:hidden"
        />

        {/* lg and up: every section stays one click away */}
        <nav aria-label="Điều hướng chính" className="hidden items-center gap-1 lg:flex">
          {sections.map((item) => {
            const isActive = item.match(pathname)
            return (
              <Button
                key={item.id}
                variant="ghost"
                size="sm"
                nativeButton={false}
                render={<Link href={item.href} />}
                aria-current={isActive ? "page" : undefined}
                className={cn(NAV_ITEM, isActive ? NAV_ACTIVE : NAV_RESTING)}
              >
                {item.icon}
                {item.label}
              </Button>
            )
          })}
        </nav>

        {/* Dưới lg: các mục gập vào một menu. */}
        <div className="flex items-center gap-0.5 lg:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="text-muted-foreground"
                  aria-label="Mục điều hướng"
                />
              }
            >
              <MenuIcon aria-hidden="true" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" sideOffset={8} className="w-48">
              <DropdownMenuGroup>
                {sections.map((item) => (
                  <DropdownMenuItem
                    key={item.id}
                    render={<Link href={item.href} />}
                    className={cn(MENU_ITEM, item.match(pathname) && "bg-accent")}
                  >
                    {item.icon}
                    {item.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-3">
        <SearchCommand entries={searchEntries} />
        <AccountMenu user={user} />
      </div>
    </header>
  )
}
