import { CircleCheckIcon, AlertCircleIcon, InfoIcon, MoreHorizontalIcon, DownloadIcon, CopyIcon, RotateCcwIcon, WalletIcon, RefreshCwIcon, ArrowUpIcon, ArrowDownIcon, MinusIcon } from "lucide-react";

/** The success toast glyph, shared by every confirmation the block raises. */
export const TOAST_SUCCESS_ICON = (
  <CircleCheckIcon className="text-success size-4" aria-hidden="true" />
)

/** The error toast glyph, so a failed copy reads like every other toast. */
export const TOAST_ERROR_ICON = (
  <AlertCircleIcon className="text-destructive size-4" aria-hidden="true" />
)

// prettier-ignore
export const UI_ICONS = {
  info:     <InfoIcon aria-hidden="true" />,
  more:     <MoreHorizontalIcon aria-hidden="true" />,
  download: <DownloadIcon aria-hidden="true" />,
  copy:     <CopyIcon aria-hidden="true" />,
  reset:    <RotateCcwIcon aria-hidden="true" />,
  empty:    <WalletIcon aria-hidden="true" />,
  error:    <AlertCircleIcon aria-hidden="true" />,
  retry:    <RefreshCwIcon aria-hidden="true" />,
}

/** A change's direction glyph; the badge sizes it. */
// prettier-ignore
export const TREND_ICONS = {
  up:   <ArrowUpIcon aria-hidden="true" />,
  down: <ArrowDownIcon aria-hidden="true" />,
  flat: <MinusIcon aria-hidden="true" />,
}