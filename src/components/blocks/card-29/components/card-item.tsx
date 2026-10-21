import { Badge } from "@/components/reui/badge"
import { cn } from "cn"

import type { ICard } from "./data"

const METRIC_AREA_LEVELS = [
  { back: [34, 2], fill: [48, 16] },
  { back: [2, 36], fill: [16, 50] },
  { back: [36, 0], fill: [50, 10] },
  { back: [0, 22], fill: [10, 32] },
] as const

const METRIC_AREA_GRADIENTS = [
  "from-indigo-400 via-indigo-500 to-indigo-600",
  "from-indigo-500 via-indigo-600 to-indigo-700",
  "from-indigo-600 via-indigo-700 to-indigo-800",
  "from-indigo-700 via-indigo-800 to-indigo-950",
] as const

function MetricAreaShape({ index }: { index: number }) {
  const levels = METRIC_AREA_LEVELS[index % METRIC_AREA_LEVELS.length]
  const fillGradient =
    METRIC_AREA_GRADIENTS[index % METRIC_AREA_GRADIENTS.length]
  const backClipPath = `polygon(0 ${levels.back[0]}%, 100% ${levels.back[1]}%, 100% 100%, 0 100%)`
  const fillClipPath = `polygon(0 ${levels.fill[0]}%, 100% ${levels.fill[1]}%, 100% 100%, 0 100%)`

  return (
    <div
      aria-hidden="true"
      className="relative -mx-4 mt-4 -mb-4 h-36 overflow-hidden"
    >
      <div
        className="absolute inset-x-0 bottom-0 h-full bg-indigo-100/80 dark:bg-indigo-950/50"
        style={{
          clipPath: backClipPath,
        }}
      />
      <div
        className={cn(
          "absolute inset-x-0 bottom-0 h-full bg-gradient-to-br",
          fillGradient
        )}
        style={{
          clipPath: fillClipPath,
        }}
      />
      <div className="absolute inset-x-0 bottom-0 h-full bg-gradient-to-t from-indigo-950/20 to-transparent" />
    </div>
  )
}

export function CardItem({
  card,
  index,
  total,
}: {
  card: ICard
  index: number
  total: number
}) {
  const isLast = index === total - 1
  const isEvenColumn = index % 2 === 1
  const isInTopTabletRow = index < total - 2

  return (
    <div
      className={cn(
        "border-border/60 flex min-h-[316px] flex-col overflow-hidden p-4",
        !isLast && "border-b",
        !isEvenColumn && "md:border-r",
        isInTopTabletRow ? "md:border-b" : "md:border-b-0",
        index < total - 1 ? "@4xl:border-r" : "@4xl:border-r-0",
        "@4xl:border-b-0"
      )}
    >
      <div className="flex flex-1 flex-col justify-between gap-4">
        <div className="[&_svg]:text-muted-foreground [&_svg]:size-5">
          {card.icon}
        </div>
        {/* Heading */}
        <div className="flex flex-col gap-1.5">
          {/* Title */}
          <h3 className="text-muted-foreground text-sm leading-relaxed">
            {card.title}
          </h3>

          <div className="flex items-center gap-1.5">
            {/* Value */}
            <div className="text-xl leading-tight font-semibold">
              {card.valueBold}
              <span className="text-muted-foreground/40 font-semibold">
                {card.valueFaint}
              </span>
            </div>
            {/* Badge */}
            <Badge variant={card.variant}>
              {card.badgeIcon != null && card.badgeIcon}
              <span>{card.badge}</span>
            </Badge>
          </div>
        </div>
        <p className="text-muted-foreground text-sm">{card.description}</p>
      </div>
      <MetricAreaShape index={index} />
    </div>
  )
}