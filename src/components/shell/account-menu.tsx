"use client"

import { useTransition } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTheme } from "next-themes"
import {
  BookmarkIcon,
  LogOutIcon,
  MonitorIcon,
  MoonIcon,
  PaletteIcon,
  SunIcon,
} from "lucide-react"

import { logout } from "@/app/actions"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

export interface ShellUser {
  email: string
  plan: "free" | "pro"
}

const THEME_OPTIONS = [
  { value: "light", label: "Sáng", icon: <SunIcon aria-hidden="true" /> },
  { value: "dark", label: "Tối", icon: <MoonIcon aria-hidden="true" /> },
  { value: "system", label: "Theo hệ thống", icon: <MonitorIcon aria-hidden="true" /> },
]

function ThemeSwatches() {
  const { theme, setTheme } = useTheme()
  // The menu mounts on open, long after the theme resolves: no hydration gate.
  const current = theme ?? "system"

  return (
    <ToggleGroup
      multiple={false}
      value={[current]}
      onValueChange={(value) => value[0] && setTheme(value[0])}
      variant="outline"
      spacing={0}
      size="sm"
      aria-label="Giao diện"
    >
      {THEME_OPTIONS.map(({ value, label, icon }) => (
        <ToggleGroupItem key={value} value={value} aria-label={label}>
          {icon}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  )
}

function initialsOf(email: string) {
  return email.slice(0, 2).toUpperCase()
}

export function AccountMenu({ user }: { user: ShellUser | null }) {
  const pathname = usePathname()
  const [pending, startTransition] = useTransition()

  if (!user) {
    return (
      <Button
        variant="outline"
        size="sm"
        className="text-xs shadow-xs"
        nativeButton={false}
        render={<Link href={`/login?next=${encodeURIComponent(pathname)}`} />}
      >
        Đăng nhập
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Menu tài khoản"
            className="-mx-0.5 rounded-full"
          />
        }
      >
        <Avatar className="size-6">
          <AvatarFallback className="text-[10px]">
            {initialsOf(user.email)}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" sideOffset={8} className="w-64">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="flex items-center gap-2.5 py-2">
            <Avatar className="size-8">
              <AvatarFallback className="text-xs font-semibold">
                {initialsOf(user.email)}
              </AvatarFallback>
            </Avatar>
            <span className="flex min-w-0 flex-col">
              <span className="text-foreground truncate text-sm font-semibold">
                {user.email}
              </span>
              <span className="text-muted-foreground truncate text-xs font-normal">
                Gói {user.plan === "pro" ? "Pro" : "Miễn phí"}
              </span>
            </span>
          </DropdownMenuLabel>

          <DropdownMenuSeparator />

          <DropdownMenuItem render={<Link href="/saved" />}>
            <BookmarkIcon aria-hidden="true" />
            Đã lưu
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          {/* The swatches set a value in place, so the menu outlives the click. */}
          <DropdownMenuItem
            closeOnClick={false}
            className="cursor-default focus:bg-transparent!"
          >
            <PaletteIcon aria-hidden="true" />
            Giao diện
            <span className="ml-auto">
              <ThemeSwatches />
            </span>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            disabled={pending}
            onClick={() => startTransition(() => logout())}
          >
            <LogOutIcon aria-hidden="true" />
            Đăng xuất
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
