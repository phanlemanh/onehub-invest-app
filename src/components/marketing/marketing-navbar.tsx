"use client"

import type { ReactNode } from "react"
import Link from "next/link"
import {
  ArrowRightIcon,
  BookOpenIcon,
  CalculatorIcon,
  GitCompareIcon,
  HouseIcon,
  MapIcon,
  MenuIcon,
} from "lucide-react"

import { BrandMark } from "@/components/shell/brand-mark"
import { AccountMenu, type ShellUser } from "@/components/shell/account-menu"
import { SearchCommand } from "@/components/shell/search-command"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import { Separator } from "@/components/ui/separator"
import type { SearchEntry } from "@/lib/queries"

type NavLink = { title: string; href: string; description: string; icon: ReactNode }

const icon = (Icon: typeof MapIcon) => <Icon className="text-muted-foreground mt-0.5 size-4 shrink-0" aria-hidden="true" />

const PRODUCT: NavLink[] = [
  { title: "Thị trường", href: "/vn", description: "Xếp hạng phường theo RevPAR, công suất, giá — kèm bản đồ.", icon: icon(MapIcon) },
  { title: "Listing", href: "/vn/hanoi/listings", description: "Duyệt listing Airbnb trên lưới và bản đồ nhãn giá.", icon: icon(HouseIcon) },
  { title: "Lợi suất", href: "/yield", description: "Ước tính lợi suất một căn: ngắn hạn so với dài hạn.", icon: icon(CalculatorIcon) },
  { title: "So sánh", href: "/so-sanh", description: "Đặt cạnh nhau tối đa 4 thị trường hoặc phường.", icon: icon(GitCompareIcon) },
]

/**
 * Thanh điều hướng trang marketing — chuyển thể từ @reui/navbar-12: logo,
 * mega menu "Sản phẩm", link phụ, nút chính trượt mũi tên. Khác bản gốc: thêm
 * ⌘K + tài khoản, và menu ☰ cho màn hình hẹp (bản gốc không có).
 */
export function MarketingNavbar({
  user,
  searchEntries,
}: {
  user: ShellUser | null
  searchEntries: SearchEntry[]
}) {
  return (
    <header className="border-border bg-background/95 supports-backdrop-filter:bg-background/80 sticky top-0 z-30 flex h-14 w-full shrink-0 items-center justify-between gap-2 border-b px-4 backdrop-blur sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <BrandMark href="/" />
        <Separator orientation="vertical" className="my-auto hidden h-4 md:block" />

        <NavigationMenu className="max-md:hidden">
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger>Sản phẩm</NavigationMenuTrigger>
              <NavigationMenuContent>
                <div className="w-[500px]">
                  <ul className="grid grid-cols-2 gap-1">
                    {PRODUCT.map((item) => (
                      <li key={item.title}>
                        <NavigationMenuLink render={<Link href={item.href} />} className="flex items-start gap-2 p-3">
                          {item.icon}
                          <div className="flex flex-col gap-0.5">
                            <div className="text-sm leading-none font-medium">{item.title}</div>
                            <p className="text-muted-foreground text-xs leading-snug">{item.description}</p>
                          </div>
                        </NavigationMenuLink>
                      </li>
                    ))}
                  </ul>
                </div>
              </NavigationMenuContent>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink render={<Link href="/phuong-phap" />} className={navigationMenuTriggerStyle()}>
                Phương pháp
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>

        <DropdownMenu>
          <DropdownMenuTrigger
            render={<Button variant="ghost" size="icon-sm" className="text-muted-foreground md:hidden" aria-label="Mục điều hướng" />}
          >
            <MenuIcon aria-hidden="true" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" sideOffset={8} className="w-56">
            <DropdownMenuGroup>
              {PRODUCT.map((item) => (
                <DropdownMenuItem key={item.title} render={<Link href={item.href} />}>
                  {item.title}
                </DropdownMenuItem>
              ))}
              <DropdownMenuItem render={<Link href="/phuong-phap" />}>
                <BookOpenIcon aria-hidden="true" />
                Phương pháp
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex shrink-0 items-center gap-3">
        <SearchCommand entries={searchEntries} />
        <AccountMenu user={user} />
        <Button
          className="group/sliding relative overflow-hidden px-6 max-sm:hidden"
          nativeButton={false}
          render={<Link href="/vn" />}
        >
          <span className="inline-flex items-center transition-transform duration-300 group-hover/sliding:-translate-x-2">
            Bắt đầu
          </span>
          <ArrowRightIcon
            aria-hidden="true"
            className="absolute right-2.5 translate-x-8 opacity-0 transition-all duration-300 group-hover/sliding:translate-x-0 group-hover/sliding:opacity-100"
          />
        </Button>
      </div>
    </header>
  )
}
