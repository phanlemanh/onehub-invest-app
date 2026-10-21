import { cn } from "cn"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"
import { AccountMenu } from "./account-menu"
import { NAV_SECTIONS } from "./data"
import { NotificationsDrawer } from "./notifications-drawer"
import { ReuiMark } from "./reui-mark"
import { SearchMenu } from "./search-menu"
import { SettingsMenu } from "./settings-menu"
import { ViewsMenu } from "./views-menu"
import { MenuIcon } from "lucide-react"

// The section pill is tighter than the stock small button: a wider icon gap, an
// 8px inset and a 12px label.
const NAV_ITEM = "gap-2 px-2 text-xs"

// The selected row is its own wash, so the stock check comes off and the
// space it reserved comes back. Focus drops to half so the two stay apart.
const MENU_ITEM =
  "data-checked:bg-accent data-highlighted:bg-accent/50 pr-1.5 **:data-[slot=dropdown-menu-radio-item-indicator]:hidden"

// The bar draws its utility icons as bare glyphs on the same 12px rhythm as the
// avatar. The negative inline margin keeps a 28px hit target without widening the row.
const GLYPH_BUTTON = "text-muted-foreground -mx-1.5"

// A resting section icon sits one step lighter than its own label; hover brings
// both to full strength.
const NAV_ACTIVE = "bg-accent dark:bg-input/50 text-foreground"
// --accent and --muted resolve to the same value, so the ghost hover would paint
// the selected pill exactly; a half-strength wash keeps the two apart.
const NAV_RESTING =
  "text-muted-foreground hover:bg-accent/50 [&_svg]:text-ring [&_svg]:transition-colors hover:text-foreground hover:[&_svg]:text-foreground"

interface TopBarProps {
  section: string
  onSelectSection: (section: string) => void
  view: string
  onSelectView: (view: string) => void
}

export function TopBar({
  section,
  onSelectSection,
  view,
  onSelectView,
}: TopBarProps) {
  return (
    <header className="flex w-full shrink-0 items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-4">
      <div className="flex min-w-0 items-center gap-2 lg:gap-4">
        <ReuiMark />
        <Separator
          orientation="vertical"
          className="h-3.5 data-vertical:self-center max-lg:hidden"
        />

        {/* lg and up: every section stays one click away */}
        <nav
          aria-label="Sections"
          className="hidden items-center gap-1 lg:flex"
        >
          {NAV_SECTIONS.map((item) => {
            const isActive = item.id === section
            return (
              <Button
                key={item.id}
                variant="ghost"
                size="sm"
                aria-current={isActive ? "page" : undefined}
                onClick={() => onSelectSection(item.id)}
                className={cn(NAV_ITEM, isActive ? NAV_ACTIVE : NAV_RESTING)}
              >
                {item.icon}
                {item.label}
              </Button>
            )
          })}
        </nav>

        {/* The two pickers a phone loses travel as one pair: where in the app,
            then which panel of it. Ghost, so neither competes with the mark. */}
        <div className="flex items-center gap-0.5 lg:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="text-muted-foreground"
                  aria-label="Sections"
                />
              }
            >
              <MenuIcon aria-hidden="true" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" sideOffset={8} className="w-44">
              <DropdownMenuRadioGroup
                value={section}
                onValueChange={onSelectSection}
              >
                {NAV_SECTIONS.map((item) => (
                  <DropdownMenuRadioItem
                    key={item.id}
                    value={item.id}
                    closeOnClick
                    className={MENU_ITEM}
                  >
                    {item.icon}
                    {item.label}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          <ViewsMenu view={view} onSelectView={onSelectView} />
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-3">
        <SearchMenu className={GLYPH_BUTTON} />
        {/* The account menu carries Settings too, so the phone drops the second
            door to the same room rather than crowding the bar. */}
        <SettingsMenu className={cn(GLYPH_BUTTON, "max-sm:hidden")} />
        <NotificationsDrawer className={GLYPH_BUTTON} />

        <AccountMenu />

        <Button variant="outline" size="sm" className="text-xs shadow-xs">
          {/* A phone bar has no room for the object, so the verb carries it. */}
          <span className="sm:hidden">Onboard</span>
          <span className="max-sm:hidden">Onboard Robot</span>
        </Button>
      </div>
    </header>
  )
}