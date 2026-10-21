import { useId } from "react"
import { cn } from "cn"

/** Bottom edge: navy at the right corner, back to the field by x = 200. */
const BOTTOM_BLOOM = [
  { offset: "0%", color: "#022092", opacity: 1 },
  { offset: "16%", color: "#0532cc", opacity: 1 },
  { offset: "32%", color: "#0638cd", opacity: 1 },
  { offset: "50%", color: "#084ad6", opacity: 1 },
  { offset: "68%", color: "#0850dd", opacity: 1 },
  { offset: "85%", color: "#0057ec", opacity: 0.5 },
  { offset: "100%", color: "#0057ec", opacity: 0 },
]

/** Right edge: the field holds down to y = 500, then falls away inside 300 units. */
const RIGHT_BLOOM = [
  { offset: "0%", color: "#011d8b", opacity: 1 },
  { offset: "30%", color: "#02218e", opacity: 1 },
  { offset: "55%", color: "#022b93", opacity: 0.92 },
  { offset: "75%", color: "#0440b4", opacity: 0.55 },
  { offset: "95%", color: "#0850dd", opacity: 0.1 },
  { offset: "100%", color: "#0850dd", opacity: 0 },
]

// Light ribbons sweeping the deep half. Only the visible edge crossings matter;
// the rest runs under the console. `width` is the core, widened unless soft is false.
const RIBBONS = [
  {
    id: "left-sweep",
    d: "M-140 1020 Q 300 690 1020 610",
    width: 26,
    soft: true,
  },
  {
    id: "bottom-near",
    d: "M505 1240 Q 640 950 1000 760",
    width: 16,
    soft: true,
  },
  {
    id: "bottom-far",
    d: "M905 1240 Q 1180 1000 1520 830",
    width: 12,
    soft: true,
  },
  {
    id: "right-high",
    d: "M1050 480 Q 1400 560 1680 645",
    width: 14,
    soft: true,
  },
  // Core only: the right edge is navy through y = 860 and lifts at y = 880, and
  // no blur halo is tight enough to leave the first and light the second.
  {
    id: "right-low",
    d: "M1200 490 Q 1470 665 1670 1015",
    width: 20,
    soft: false,
  },
]

export function FrameBackdrop({ className }: { className?: string }) {
  const uid = useId().replace(/:/g, "")
  const fieldId = `${uid}-field`
  const bottomId = `${uid}-bottom`
  const rightId = `${uid}-right`
  const softId = `${uid}-soft`

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 1600 1200"
      preserveAspectRatio="none"
      className={cn(
        "pointer-events-none absolute inset-0 size-full",
        className
      )}
    >
      <defs>
        {/* The field itself barely moves: four units of blue across 1600. */}
        <linearGradient id={fieldId} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#005aee" />
          <stop offset="100%" stopColor="#0054ea" />
        </linearGradient>

        {/* Unit circles placed by transform, so each radius reads as the ellipse
            it actually is. */}
        <radialGradient
          id={bottomId}
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="translate(1600 1200) scale(1900 640)"
        >
          {BOTTOM_BLOOM.map((stop) => (
            <stop
              key={stop.offset}
              offset={stop.offset}
              stopColor={stop.color}
              stopOpacity={stop.opacity}
            />
          ))}
        </radialGradient>

        <radialGradient
          id={rightId}
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="translate(1620 1090) scale(340 600)"
        >
          {RIGHT_BLOOM.map((stop) => (
            <stop
              key={stop.offset}
              offset={stop.offset}
              stopColor={stop.color}
              stopOpacity={stop.opacity}
            />
          ))}
        </radialGradient>

        {/* One blur pass for all five ribbons. A gradient cannot run across a
            stroke, so the soft edge has to come from a filter. */}
        <filter
          id={softId}
          x="-10%"
          y="-10%"
          width="120%"
          height="120%"
          colorInterpolationFilters="sRGB"
        >
          <feGaussianBlur stdDeviation="20" />
        </filter>
      </defs>

      <rect width="1600" height="1200" fill={`url(#${fieldId})`} />
      <rect width="1600" height="1200" fill={`url(#${bottomId})`} />
      <rect width="1600" height="1200" fill={`url(#${rightId})`} />

      <g fill="none" stroke="#12a6f4" strokeLinecap="round">
        <g filter={`url(#${softId})`} opacity={0.34}>
          {RIBBONS.filter((ribbon) => ribbon.soft).map((ribbon) => (
            <path
              key={ribbon.id}
              d={ribbon.d}
              strokeWidth={ribbon.width * 3.4}
            />
          ))}
        </g>
        {/* The unblurred core is what makes a ribbon read as an edge of light
            rather than as a smudge. */}
        <g opacity={0.42}>
          {RIBBONS.map((ribbon) => (
            <path key={ribbon.id} d={ribbon.d} strokeWidth={ribbon.width} />
          ))}
        </g>
      </g>
    </svg>
  )
}