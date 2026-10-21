"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { MapIcon, MapPinIcon, SearchIcon } from "lucide-react"

import { Badge } from "@/components/reui/badge"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Kbd } from "@/components/ui/kbd"
import type { SearchEntry } from "@/lib/queries"

/**
 * ⌘K tìm khu vực. Trigger + phím tắt theo search-menu của app-shell-30;
 * danh sách theo c-command-5 (tên, đường dẫn mờ, badge loại).
 */
export function SearchCommand({
  entries,
  variant = "bar",
}: {
  entries: SearchEntry[]
  /** "bar" = ô nhỏ trên thanh trên cùng; "hero" = ô lớn ở hero trang chủ. */
  variant?: "bar" | "hero"
}) {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Ô ở hero không giữ ⌘K: thanh trên cùng đã giữ, hai nơi cùng nghe sẽ mở hai hộp.
    if (variant === "hero") return
    function onKeyDown(event: KeyboardEvent) {
      if (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault()
        setOpen(true)
      }
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [variant])

  const markets = entries.filter((e) => e.kind === "market")
  const submarkets = entries.filter((e) => e.kind === "submarket")

  function go(href: string) {
    setOpen(false)
    router.push(href)
  }

  return (
    <>
      {variant === "hero" ? (
        <Button
          type="button"
          variant="outline"
          size="lg"
          onClick={() => setOpen(true)}
          aria-haspopup="dialog"
          aria-expanded={open}
          className="text-muted-foreground w-full max-w-md justify-start shadow-xs"
        >
          <SearchIcon aria-hidden="true" />
          Tìm tỉnh, quận, phường…
          <Kbd className="ml-auto">⌘K</Kbd>
        </Button>
      ) : (
      <>
      {/* Desktop: ô tìm có gợi ý phím; điện thoại: chỉ còn kính lúp. */}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
        className="text-muted-foreground w-56 text-xs shadow-xs max-md:hidden"
      >
        <SearchIcon aria-hidden="true" />
        Tìm tỉnh, phường…
        <Kbd className="ml-auto">⌘K</Kbd>
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        aria-label="Tìm khu vực"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className="text-muted-foreground -mx-1.5 md:hidden"
      >
        <SearchIcon aria-hidden="true" />
      </Button>
      </>
      )}

      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        title="Tìm khu vực"
        description="Tìm thị trường hoặc phường/xã theo tên"
      >
        <Command className="**:data-[selected=true]:bg-muted **:data-selected:bg-transparent">
          <CommandInput placeholder="Gõ tên tỉnh, quận, phường… (không dấu cũng được)" />
          <CommandList>
            <CommandEmpty>Không tìm thấy khu vực nào.</CommandEmpty>
            <CommandGroup heading="Thị trường">
              {markets.map((entry) => (
                <SearchItem key={entry.id} entry={entry} onSelect={go} />
              ))}
            </CommandGroup>
            <CommandGroup heading="Phường / xã">
              {submarkets.map((entry) => (
                <SearchItem key={entry.id} entry={entry} onSelect={go} />
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  )
}

function SearchItem({
  entry,
  onSelect,
}: {
  entry: SearchEntry
  onSelect: (href: string) => void
}) {
  const isMarket = entry.kind === "market"
  const Icon = isMarket ? MapIcon : MapPinIcon
  return (
    <CommandItem
      value={entry.id}
      keywords={[entry.name, entry.slug.replace(/-/g, " "), entry.parentName ?? ""]}
      onSelect={() => onSelect(entry.href)}
      className="gap-2.5"
    >
      <Icon className="size-4 shrink-0" aria-hidden="true" />
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <span className="truncate font-medium">{entry.name}</span>
        {entry.parentName && (
          <span className="text-muted-foreground truncate text-xs">
            {entry.parentName}
          </span>
        )}
      </div>
      <div className="ml-auto" data-slot="command-shortcut">
        <Badge variant="outline" size="sm">
          {isMarket ? "Thị trường" : "Phường"}
        </Badge>
      </div>
    </CommandItem>
  )
}
