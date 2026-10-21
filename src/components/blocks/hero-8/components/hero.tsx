"use client"

/**
 * Split hero: badge, two-tone headline, subtitle, inline email capture and a proof
 * pair, beside a product frame on its own drawn backdrop.
 * The section sizes to its content rather than the viewport, so it can sit anywhere.
 * customize: copy here; the console in app-frame.tsx and data.tsx.
 */
import { useState } from "react"
import { Badge } from "@/components/reui/badge"

import { Button } from "@/components/ui/button"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group"
import { Label } from "@/components/ui/label"
import { AppFrame } from "./app-frame"
import { AzureMark } from "./azure-mark"
import { FrameBackdrop } from "./frame-backdrop"
import { CircleCheckIcon, ArrowRightIcon } from "lucide-react"

// Both render with the same check mark, so keep them parallel in length.
const HERO_PROOF_POINTS = ["Azure native", "Enterprise ready"]

export function Hero() {
  const [email, setEmail] = useState("")
  const [joined, setJoined] = useState(false)

  return (
    <section
      aria-labelledby="hero-8-title"
      className="bg-background relative flex min-h-svh w-full items-center overflow-hidden px-4 py-12 sm:px-6 lg:px-8"
    >
      {/* Grid rather than flex-wrap: flex-1 resolves to flex-basis 0%, so the
          columns only wrapped far below the design's 288px minimum. */}
      {/* Stacked, the band takes the art's own measure rather than the full
          track, so the copy keeps a readable line instead of running the whole
          width above a narrower centred visual. */}
      <div className="relative mx-auto grid w-full max-w-xl grid-cols-1 items-center gap-8 lg:max-w-7xl lg:grid-cols-2">
        <div className="@container flex flex-col items-start justify-center gap-6">
          {/* `xl` already carries the design's 8px inset, 6px gap and 14px
              medium label, so only the 28px height is set. */}
          <Badge
            variant="outline"
            size="xl"
            radius="full"
            className="text-foreground h-7"
          >
            <AzureMark className="size-3.5 shrink-0" />
            Powered by Azure
          </Badge>

          {/* Two-tone headline: the muted second line is the emphasis, so keep the
              split if you change the copy. */}
          <h1
            id="hero-8-title"
            className="text-foreground text-4xl leading-tight font-semibold tracking-tight @lg:text-5xl @lg:leading-none"
          >
            <span className="@lg:block">Modern cloud stack</span>{" "}
            <span className="text-muted-foreground @lg:block">
              built for scale
            </span>
          </h1>

          <p className="text-muted-foreground text-base leading-6">
            A unified platform for deploying, monitoring, and managing cloud
            infrastructure across Azure environments with secure automation and
            real time visibility.
          </p>

          {/* The live region wraps the swap: a status node mounted at the moment it
              changes is announced by nothing. */}
          <div aria-live="polite" className="flex min-h-8 items-center">
            {joined ? (
              <p className="text-foreground flex items-center gap-2 text-sm leading-5 font-medium">
                <CircleCheckIcon aria-hidden="true" className="text-success size-4 shrink-0" />
                You are on the list.
              </p>
            ) : (
              <form
                onSubmit={(event) => {
                  event.preventDefault()
                  setJoined(true)
                }}
                className="flex flex-wrap items-center gap-2"
              >
                <Label htmlFor="hero-8-email" className="sr-only">
                  Email
                </Label>
                {/* Only the width is set; height and radius are the primitive's own
                    defaults. */}
                <InputGroup className="w-60">
                  <InputGroupAddon>
                    <InputGroupText>@</InputGroupText>
                  </InputGroupAddon>
                  <InputGroupInput
                    id="hero-8-email"
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="Email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                  />
                </InputGroup>
                <Button type="submit">
                  Join
                  <ArrowRightIcon data-icon="inline-end" aria-hidden="true" />
                </Button>
              </form>
            )}
          </div>

          <ul className="flex flex-col gap-3">
            {HERO_PROOF_POINTS.map((point) => (
              <li key={point} className="flex items-center gap-2">
                {/* The check takes foreground ink and the label muted, rather than
                    tinting both. */}
                <CircleCheckIcon aria-hidden="true" className="text-foreground size-4 shrink-0" />
                <span className="text-muted-foreground text-base leading-6">
                  {point}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Insets are cqw shares of the frame width, so the assembly scales as one
            piece. Two containers because a container cannot size from its own units. */}
        <div className="@container w-full">
          {/* No min-width here: the band's own cap carries the sizing, and a
              minimum would overflow the padded column at 320. */}
          <div className="border-input/30 dark:border-input/20 relative aspect-[4/3] overflow-hidden rounded-xl border p-[5cqw]">
            <FrameBackdrop />
            {/* Softened on dark: the backdrop is fixed art, so the white band that
                reads as a bevel in light reads as a halo in dark. */}
            <div className="relative size-full rounded-xl bg-white/25 p-[1.25cqw] dark:bg-white/15">
              <div className="@container size-full">
                <AppFrame />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}