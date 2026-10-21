import { useState } from "react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

import { GRANULARITIES, type ViewState } from "./data"
import { UI_ICONS } from "./icons"
import { useTriggerTooltip } from "./use-trigger-tooltip"

export interface ChartActions {
  downloadCsv: () => void
  copySummary: () => void
}

/** The grouping toggle, then a menu for layers and export. */
export function ChartToolbar({
  view,
  onViewChange,
  actions,
}: {
  view: ViewState
  onViewChange: (patch: Partial<ViewState>) => void
  actions: ChartActions
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Re-clicking the pressed item sends an empty array; the guard
          keeps a grouping selected. */}
      <ToggleGroup
        multiple={false}
        value={[view.granularity]}
        onValueChange={(value) => {
          const next = GRANULARITIES.find((item) => item.value === value[0])
          if (next) onViewChange({ granularity: next.value })
        }}
        variant="outline"
        size="sm"
        spacing={0}
        aria-label="Gộp theo"
      >
        {GRANULARITIES.map((item) => (
          <ToggleGroupItem
            key={item.value}
            value={item.value}
            // Pressed lifts to the card surface: the stock muted fill is the
            // header band's own tone and would vanish on it.
            className="text-muted-foreground data-pressed:bg-card dark:data-pressed:bg-muted data-pressed:text-foreground"
          >
            {item.label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
      <MoreMenu view={view} onViewChange={onViewChange} actions={actions} />
    </div>
  )
}

// Layer toggles keep the menu open, so both can change in one visit.
function MoreMenu({
  view,
  onViewChange,
  actions,
}: {
  view: ViewState
  onViewChange: (patch: Partial<ViewState>) => void
  actions: ChartActions
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
                  size="icon-sm"
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
      <DropdownMenuContent align="end" className="w-auto">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Hiện</DropdownMenuLabel>
          <DropdownMenuCheckboxItem
            checked={view.target}
            onCheckedChange={(next: boolean) => onViewChange({ target: next })}
            closeOnClick={false}
          >
            {UI_ICONS.target}
            Mốc ngang thuê dài hạn
          </DropdownMenuCheckboxItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuLabel>Xuất dữ liệu</DropdownMenuLabel>
          <DropdownMenuItem onClick={actions.downloadCsv}>
            {UI_ICONS.download}
            Tải CSV
          </DropdownMenuItem>
          <DropdownMenuItem onClick={actions.copySummary}>
            {UI_ICONS.summary}
            Sao chép tóm tắt
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}