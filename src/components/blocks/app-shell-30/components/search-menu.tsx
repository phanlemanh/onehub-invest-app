import { useEffect, useId, useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { SearchIcon } from "lucide-react"

export function SearchMenu({ className }: { className?: string }) {
  const [open, setOpen] = useState(false)
  const searchInputId = useId()

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault()
        setOpen(true)
      }
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [])

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        aria-label="Search"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className={className}
      >
        <SearchIcon aria-hidden="true" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogHeader className="sr-only">
          <DialogTitle>Search Fleet</DialogTitle>
          <DialogDescription>
            Search across every robot, zone and mission.
          </DialogDescription>
        </DialogHeader>
        <DialogContent className="max-w-md px-4 py-2 **:data-[slot=dialog-close]:top-3 **:data-[slot=dialog-close]:right-3 **:data-[slot=dialog-close]:opacity-60">
          <div className="relative flex items-center gap-3">
            <SearchIcon className="pointer-events-none size-4 opacity-60 select-none" aria-hidden="true" />
            <Input
              id={searchInputId}
              className="h-10 border-none p-0 shadow-none outline-none focus-visible:ring-0"
              autoFocus
              placeholder="Search robots, zones, missions"
              aria-label="Search"
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}