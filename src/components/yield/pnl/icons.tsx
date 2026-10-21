import { ChartColumnIcon, MoreHorizontalIcon, CalendarClockIcon, TargetIcon, DownloadIcon, FileTextIcon, TrendingUp, TrendingDown, CircleCheckIcon, AlertCircleIcon } from "lucide-react";

/** Chrome glyphs, unsized: the owning Button, menu item or tile sizes them. */
// prettier-ignore
export const UI_ICONS = {
  ledger:   <ChartColumnIcon aria-hidden="true" />,
  more:     <MoreHorizontalIcon aria-hidden="true" />,
  forecast: <CalendarClockIcon aria-hidden="true" />,
  target:   <TargetIcon aria-hidden="true" />,
  download: <DownloadIcon aria-hidden="true" />,
  summary:  <FileTextIcon aria-hidden="true" />,
}

/** Direction glyphs at the house glyph size, for a tooltip row's slot. */
// prettier-ignore
export const TREND_ICONS = {
  up:   <TrendingUp className="size-4" aria-hidden="true" />,
  down: <TrendingDown className="size-4" aria-hidden="true" />,
}

/** The same glyphs at badge size: the Badge sizes its own icons. */
// prettier-ignore
export const BADGE_TREND_ICONS = {
  up:   <TrendingUp aria-hidden="true" />,
  down: <TrendingDown aria-hidden="true" />,
}

export const TOAST_SUCCESS_ICON = (
  <CircleCheckIcon className="text-success size-4" aria-hidden="true" />
)

export const TOAST_ERROR_ICON = (
  <AlertCircleIcon className="text-destructive size-4" aria-hidden="true" />
)