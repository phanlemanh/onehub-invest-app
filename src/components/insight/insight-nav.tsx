"use client"

import { useEffect, useState } from "react"
import { ChevronDownIcon, LayersIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

export type InsightSection = { id: string; label: string }

/** Chiều cao thanh dính + khoảng thở, để tiêu đề phần không bị thanh che. */
const STICKY_OFFSET = 72

// View track của @reui/app-shell-30 (workspace-tabs), dựng bằng link neo thay
// cho Tabs: mỗi mục cuộn tới một phần của CÙNG trang (IA L6).
const TAB_LIST =
  "bg-input/30 inset-ring-ring/20 inline-flex h-7 w-fit shrink-0 items-center rounded-lg p-0 inset-ring"
const TAB_TRIGGER =
  "text-muted-foreground relative inline-flex h-full items-center justify-center rounded-md px-2.5 py-0.5 text-xs font-medium whitespace-nowrap transition-colors hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none data-active:bg-background data-active:text-foreground data-active:shadow-xs data-active:inset-ring data-active:inset-ring-ring/50 dark:data-active:bg-background dark:data-active:inset-ring-ring/30"
const ROW =
  "data-checked:bg-accent data-highlighted:bg-accent/50 pr-1.5 **:data-[slot=dropdown-menu-radio-item-indicator]:hidden"

/**
 * Mục đang xem = phần cuối cùng có đỉnh đã qua thanh dính; cuộn tới đáy thì là
 * mục cuối. Cùng thuật toán với @reui/scrollspy nhưng chỉ đọc cuộn của window:
 * Scrollspy với target document tự bám vào `scroll-area-viewport` đầu tiên trong
 * trang (vùng cuộn của DataGrid) và luôn báo nhầm mục cuối.
 */
function activeSectionOf(sections: InsightSection[]) {
  const doc = document.documentElement
  if (window.scrollY + window.innerHeight >= doc.scrollHeight - 2) {
    return sections.at(-1)?.id
  }
  let active = sections[0]?.id
  for (const section of sections) {
    const el = document.getElementById(section.id)
    if (el && el.getBoundingClientRect().top - STICKY_OFFSET - 1 <= 0) {
      active = section.id
    }
  }
  return active
}

export function InsightNav({ sections }: { sections: InsightSection[] }) {
  const [active, setActive] = useState(sections[0]?.id ?? "")
  const current = sections.find((section) => section.id === active)

  // Đo lại khi cuộn và khi chiều cao trang đổi (biểu đồ giãn sau hydrate).
  useEffect(() => {
    let frame = 0
    const measure = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        const next = activeSectionOf(sections)
        if (next) setActive(next)
      })
    }
    const observer = new ResizeObserver(measure)
    observer.observe(document.body)
    window.addEventListener("scroll", measure, { passive: true })
    measure()
    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
      window.removeEventListener("scroll", measure)
    }
  }, [sections])

  function jump(id: string) {
    const target = document.getElementById(id)
    if (!target) return
    const top = target.getBoundingClientRect().top + window.scrollY - STICKY_OFFSET
    window.scrollTo({ top, behavior: "smooth" })
    setActive(id)
  }

  return (
    <div className="bg-background/95 supports-backdrop-filter:bg-background/80 sticky top-0 z-20 -mx-4 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
      {/* md trở lên: cả track; dưới md: một menu, như ViewsMenu của shell. */}
      <nav aria-label="Các phần của trang" className={cn(TAB_LIST, "max-md:hidden")}>
        {sections.map((section) => (
          <a
            key={section.id}
            href={`#${section.id}`}
            data-active={section.id === active ? "true" : undefined}
            aria-current={section.id === active ? "location" : undefined}
            onClick={(event) => {
              event.preventDefault()
              jump(section.id)
            }}
            className={TAB_TRIGGER}
          >
            {section.label}
          </a>
        ))}
      </nav>

      <div className="md:hidden">
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="outline" size="sm" className="text-xs shadow-xs" />
            }
          >
            <LayersIcon data-icon="inline-start" aria-hidden="true" />
            {current?.label ?? "Các phần"}
            <ChevronDownIcon className="text-muted-foreground" aria-hidden="true" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" sideOffset={8} className="w-48">
            <DropdownMenuRadioGroup value={active} onValueChange={jump}>
              {sections.map((section) => (
                <DropdownMenuRadioItem
                  key={section.id}
                  value={section.id}
                  closeOnClick
                  className={ROW}
                >
                  {section.label}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
