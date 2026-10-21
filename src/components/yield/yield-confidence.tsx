"use client"

import { cn } from "cn"

import { Badge, type BadgeProps } from "@/components/reui/badge"
import {
  Frame,
  FrameDescription,
  FrameHeader,
  FramePanel,
  FrameTitle,
} from "@/components/reui/frame"
import { Progress, ProgressLabel } from "@/components/ui/progress"
import type { Confidence } from "@/lib/yield"

const LEVEL: Record<Confidence["level"], { value: number; variant: BadgeProps["variant"]; bar: string }> = {
  Cao: { value: 100, variant: "success-light", bar: "**:data-[slot=progress-indicator]:bg-success" },
  "Trung bình": { value: 66, variant: "info-light", bar: "**:data-[slot=progress-indicator]:bg-info" },
  Thấp: { value: 33, variant: "warning-light", bar: "**:data-[slot=progress-indicator]:bg-warning" },
}

/**
 * Độ tin cậy của ước tính (AirDNA "Comp Set Strength"): thanh 3 mức + lý do,
 * và các giả định đứng sau con số. Thanh theo mẫu ScoreCell (Progress) của
 * data-grid-base-2.
 */
export function YieldConfidence({
  confidence,
  assumptions,
}: {
  confidence: Confidence
  assumptions: string[]
}) {
  const level = LEVEL[confidence.level]
  return (
    <Frame spacing="default" className="w-full min-w-0">
      <FrameHeader className="flex-row flex-wrap items-center justify-between gap-2">
        <div className="flex min-w-0 flex-col gap-px">
          <FrameTitle role="heading" aria-level={2}>
            Độ tin cậy của ước tính
          </FrameTitle>
          <FrameDescription>Dựa trên số và độ giống của listing so sánh</FrameDescription>
        </div>
        <Badge variant={level.variant}>{confidence.level}</Badge>
      </FrameHeader>
      <FramePanel className="grid gap-6 md:grid-cols-2">
        <div className="flex flex-col gap-3">
          <Progress value={level.value} className={cn("flex-nowrap", level.bar)}>
            <ProgressLabel className="sr-only">Độ tin cậy {confidence.level}</ProgressLabel>
          </Progress>
          <ul className="text-muted-foreground flex list-disc flex-col gap-1 ps-4 text-sm">
            {confidence.reasons.map((reason) => (
              <li key={reason}>{reason}</li>
            ))}
          </ul>
        </div>
        <div className="flex flex-col gap-2">
          <h3 className="text-sm font-medium">Giả định</h3>
          <ul className="text-muted-foreground flex list-disc flex-col gap-1 ps-4 text-sm">
            {assumptions.map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ul>
        </div>
      </FramePanel>
    </Frame>
  )
}
