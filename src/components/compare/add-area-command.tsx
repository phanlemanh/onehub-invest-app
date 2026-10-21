"use client"

import { useState } from "react"
import { MapIcon, MapPinIcon, PlusIcon } from "lucide-react"

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
import type { SearchEntry } from "@/lib/queries"

/** "Thêm khu vực" — cùng mẫu c-command-5 với ô ⌘K của shell, chọn để thêm cột. */
export function AddAreaCommand({
  entries,
  exclude,
  disabled,
  onAdd,
}: {
  entries: SearchEntry[]
  exclude: string[]
  disabled: boolean
  onAdd: (id: string) => void
}) {
  const [open, setOpen] = useState(false)
  const available = entries.filter((e) => !exclude.includes(e.id))
  const groups = [
    { heading: "Thị trường", items: available.filter((e) => e.kind === "market") },
    { heading: "Phường / xã", items: available.filter((e) => e.kind === "submarket") },
  ]
  return (
    <>
      <Button type="button" variant="outline" size="sm" disabled={disabled} onClick={() => setOpen(true)}>
        <PlusIcon data-icon="inline-start" aria-hidden="true" />
        Thêm khu vực
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen} title="Thêm khu vực" description="Chọn khu vực để so sánh">
        <Command className="**:data-[selected=true]:bg-muted **:data-selected:bg-transparent">
          <CommandInput placeholder="Gõ tên tỉnh, phường… (không dấu cũng được)" />
          <CommandList>
            <CommandEmpty>Không tìm thấy khu vực nào.</CommandEmpty>
            {groups.map((group) => (
              <CommandGroup key={group.heading} heading={group.heading}>
                {group.items.map((entry) => (
                  <CommandItem
                    key={entry.id}
                    value={entry.id}
                    keywords={[entry.name, entry.slug.replace(/-/g, " "), entry.parentName ?? ""]}
                    onSelect={() => {
                      setOpen(false)
                      onAdd(entry.id)
                    }}
                    className="gap-2.5"
                  >
                    {entry.kind === "market" ? (
                      <MapIcon className="size-4 shrink-0" aria-hidden="true" />
                    ) : (
                      <MapPinIcon className="size-4 shrink-0" aria-hidden="true" />
                    )}
                    <div className="flex min-w-0 flex-1 items-center gap-2">
                      <span className="truncate font-medium">{entry.name}</span>
                      {entry.parentName && (
                        <span className="text-muted-foreground truncate text-xs">{entry.parentName}</span>
                      )}
                    </div>
                    <div className="ml-auto" data-slot="command-shortcut">
                      <Badge variant="outline" size="sm">
                        {entry.kind === "market" ? "Thị trường" : "Phường"}
                      </Badge>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  )
}
