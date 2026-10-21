import { useState } from "react"

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
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

import { PERIODS, type PeriodKey } from "./data"
import { UI_ICONS } from "./icons"
import { useTriggerTooltip } from "./use-trigger-tooltip"
import { CAP_BOX } from "./value-faces"

export interface CardActions {
  exportCsv: () => void
  copySummary: () => void
  resetView: () => void
}

/** The header toolbar: the period, then the actions menu. Narrow, the period
 *  spans the band and the menu sits beside it. */
export function CardToolbar({
  period,
  onPeriodChange,
  canExport,
  canReset,
  actions,
}: {
  period: PeriodKey
  onPeriodChange: (next: PeriodKey) => void
  /** Off while there is no data to export or summarise. */
  canExport: boolean
  canReset: boolean
  actions: CardActions
}) {
  return (
    <div className="flex w-full items-center gap-2 @md:w-auto">
      {/* Re-clicking the pressed item clears the value; the guard keeps a
          period selected. */}
      <ToggleGroup
        multiple={false}
        value={[period]}
        onValueChange={(value: string[]) => {
          const next = PERIODS.find((item) => item.value === value[0])
          if (next) onPeriodChange(next.value)
        }}
        variant="outline"
        spacing={0}
        aria-label="Period"
        // A toolbar, not a group: it carries the arrow-key orientation the
        // primitive sets, which ARIA does not allow on a group.
        role="toolbar"
        className="@max-md:flex-1"
      >
        {PERIODS.map((item) => (
          <ToggleGroupItem
            key={item.value}
            value={item.value}
            // Pressed lifts to the card: the stock muted fill is the header
            // band's own tone and would vanish on it.
            className="text-muted-foreground data-pressed:bg-card data-pressed:text-foreground dark:data-pressed:bg-muted @max-md:flex-1"
          >
            <span className={CAP_BOX}>{item.label}</span>
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
      <MoreMenu actions={actions} canExport={canExport} canReset={canReset} />
    </div>
  )
}

function MoreMenu({
  actions,
  canExport,
  canReset,
}: {
  actions: CardActions
  canExport: boolean
  canReset: boolean
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
                  aria-label="More actions"
                  {...hint.triggerProps}
                />
              }
            />
          }
        >
          {UI_ICONS.more}
        </TooltipTrigger>
        <TooltipContent>More actions</TooltipContent>
      </Tooltip>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Data</DropdownMenuLabel>
          <DropdownMenuItem disabled={!canExport} onClick={actions.exportCsv}>
            {UI_ICONS.download}
            Export CSV
          </DropdownMenuItem>
          <DropdownMenuItem disabled={!canExport} onClick={actions.copySummary}>
            {UI_ICONS.copy}
            Copy summary
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuLabel>View</DropdownMenuLabel>
          <DropdownMenuItem disabled={!canReset} onClick={actions.resetView}>
            {UI_ICONS.reset}
            Reset view
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}