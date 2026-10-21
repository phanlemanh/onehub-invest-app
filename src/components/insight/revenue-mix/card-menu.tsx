import { useState } from "react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

import { UI_ICONS } from "./icons"
import { useTriggerTooltip } from "./use-trigger-tooltip"

export interface CardActions {
  exportCsv: () => void
  copySummary: () => void
}

/** The header menu: export and summary (no period switch — one window). */
export function MoreMenu({
  actions,
  canExport,
}: {
  actions: CardActions
  canExport: boolean
}) {
  const [open, setOpen] = useState(false)
  const hint = useTriggerTooltip(open)
  return (
    <DropdownMenu open={open} onOpenChange={(next: boolean) => setOpen(next)}>
      <Tooltip {...hint.tooltip}>
        <TooltipTrigger
          render={
            <DropdownMenuTrigger
              render={
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  aria-label="Thao tác khác"
                  {...hint.triggerProps}
                />
              }
            />
          }
        >
          {UI_ICONS.more}
        </TooltipTrigger>
        <TooltipContent>Thao tác khác</TooltipContent>
      </Tooltip>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Dữ liệu</DropdownMenuLabel>
          <DropdownMenuItem disabled={!canExport} onClick={actions.exportCsv}>
            {UI_ICONS.download}
            Tải CSV
          </DropdownMenuItem>
          <DropdownMenuItem disabled={!canExport} onClick={actions.copySummary}>
            {UI_ICONS.copy}
            Sao chép tóm tắt
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}