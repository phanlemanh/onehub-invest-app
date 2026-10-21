export const formatMillions = (amount: number) => `$${amount.toFixed(1)}M`

/** "+6.9%", "-6.8%" or "0.0%", signed so the direction reads without color. */
export function formatChange(ratio: number) {
  const percent = Math.round(ratio * 1000) / 10
  if (percent === 0) return "0.0%"
  return `${percent > 0 ? "+" : "-"}${Math.abs(percent).toFixed(1)}%`
}