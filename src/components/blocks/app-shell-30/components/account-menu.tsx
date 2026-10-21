import { useTheme } from "next-themes"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group"
import { ACCOUNT, THEME_OPTIONS } from "./data"
import { UserIcon, SettingsIcon, PaletteIcon, LogOutIcon } from "lucide-react"

function ThemeSwatches() {
  const { theme, setTheme } = useTheme()
  // The menu mounts on open, long after the theme resolves: no hydration gate.
  const current = theme ?? "system"

  return (
    <ToggleGroup
      multiple={false}
      value={[current]}
      // A theme is always set, so pressing the active one again changes nothing.
      onValueChange={(value) => value[0] && setTheme(value[0])}
      variant="outline"
      spacing={0}
      size="sm"
      aria-label="Theme"
    >
      {THEME_OPTIONS.map(({ value, label, icon }) => (
        <ToggleGroupItem key={value} value={value} aria-label={label}>
          {icon}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  )
}

export function AccountMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Account menu"
            // The bar seats a 24px portrait; the negative inline margin keeps a
            // 28px hit target without widening the row.
            className="-mx-0.5 rounded-full"
          />
        }
      >
        <Avatar className="size-6">
          <AvatarImage src={ACCOUNT.image} alt={ACCOUNT.name} />
          <AvatarFallback className="text-[10px]">
            {ACCOUNT.initials}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" sideOffset={8} className="w-64">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="flex items-center gap-2.5 py-2">
            <Avatar className="size-8">
              <AvatarImage src={ACCOUNT.image} alt={ACCOUNT.name} />
              <AvatarFallback className="text-xs font-semibold">
                {ACCOUNT.initials}
              </AvatarFallback>
            </Avatar>
            <span className="flex min-w-0 flex-col">
              <span className="text-foreground truncate text-sm font-semibold">
                {ACCOUNT.name}
              </span>
              <span className="text-muted-foreground truncate text-xs font-normal">
                {ACCOUNT.email}
              </span>
            </span>
          </DropdownMenuLabel>

          <DropdownMenuSeparator />

          <DropdownMenuGroup>
            <DropdownMenuItem>
              <UserIcon aria-hidden="true" />
              Profile
              <DropdownMenuShortcut>&#8679;&#8984;P</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <SettingsIcon aria-hidden="true" />
              Settings
            </DropdownMenuItem>
          </DropdownMenuGroup>

          <DropdownMenuSeparator />

          {/* The swatches set a value in place, so the menu outlives the click. */}
          <DropdownMenuItem
            closeOnClick={false}
            className="cursor-default focus:bg-transparent!"
          >
            <PaletteIcon aria-hidden="true" />
            Theme
            <span className="ml-auto">
              <ThemeSwatches />
            </span>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem>
            <LogOutIcon aria-hidden="true" />
            Sign Out
            <DropdownMenuShortcut>&#8679;&#8984;Q</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}