import { Badge } from "@/components/reui/badge"
import { IconTile } from "@/components/reui/icon-tile"

import { Button } from "@/components/ui/button"
import { Card, CardHeader } from "@/components/ui/card"
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@/components/ui/item"
import { HOW_IT_WORKS_STEPS } from "./data"
import { SparklesIcon, ArrowUpRightIcon, BookOpenIcon, LayoutGridIcon } from "lucide-react"

export function HowItWorks() {
  return (
    <section
      aria-labelledby="how-it-works-1-title"
      className="bg-background text-foreground w-full px-4 py-12 sm:px-6 lg:px-8"
    >
      <div className="@container mx-auto w-full max-w-7xl">
        {/* The Card owns the perimeter, the ring and the per-style radius, and
            clips the step grid to its corners. customize: spacing token below. */}
        <Card className="gap-0 pb-0 [--card-spacing:--spacing(6)]">
          {/* Two bottom-aligned columns while there is room, then one column
              where the actions keep the copy's left spine instead of floating. */}
          <CardHeader className="grid gap-8 pb-(--card-spacing) @3xl:grid-cols-[1fr_auto] @3xl:items-end">
            <div className="flex min-w-0 flex-col items-start gap-4">
              {/* The arrow makes the eyebrow a real link, not a decorative pill.
                  `xl` carries the inset, gap and label; height and glyph are set. */}
              <Badge
                variant="outline"
                size="xl"
                radius="full"
                render={<a href="#" />}
                className="text-foreground hover:bg-accent h-7 transition-colors [&_svg]:size-3.5!"
              >
                <SparklesIcon aria-hidden="true" />
                How ReUI Works
                <ArrowUpRightIcon aria-hidden="true" />
              </Badge>

              <h2
                id="how-it-works-1-title"
                className="text-3xl font-semibold @xl:text-4xl"
              >
                From Idea to Interface
              </h2>

              <p className="text-muted-foreground max-w-[40rem] text-base">
                Discover production-ready components, install them through the
                ReUI registry, and customize every detail with tools designed
                for modern AI workflows.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-2 @3xl:w-80 @3xl:justify-end">
              <Button
                variant="outline"
                size="lg"
                nativeButton={false}
                render={<a href="#" />}
              >
                <BookOpenIcon data-icon="inline-start" aria-hidden="true" />
                View Docs
              </Button>

              <Button size="lg" nativeButton={false} render={<a href="#" />}>
                <LayoutGridIcon data-icon="inline-start" aria-hidden="true" />
                Browse Registry
              </Button>
            </div>
          </CardHeader>

          {/* Three across or one per row, never a lopsided two plus one. The
              row is pulled a pixel wide so each left rule hides under the edge. */}
          <ol role="list" className="-mx-px grid grid-cols-1 @4xl:grid-cols-3">
            {HOW_IT_WORKS_STEPS.map((step, index) => (
              <li
                key={step.id}
                className="border-border min-w-0 border-t border-l p-3"
              >
                <Item className="border-0">
                  {/* Borderless 5% tint around a shadowed card, the step chip.
                      customize: swap the numeral for an icon. */}
                  <IconTile
                    variant="frame"
                    className="bg-primary/5 self-start border-0 [--icon-tile-inset:--spacing(1)]"
                  >
                    <span aria-hidden="true" className="text-base font-medium">
                      {index + 1}
                    </span>
                  </IconTile>
                  <ItemContent className="gap-px">
                    <ItemTitle className="line-clamp-none leading-5">
                      {step.title}
                    </ItemTitle>
                    {/* Unclamped: a step loses its meaning the moment it is cut. */}
                    <ItemDescription className="line-clamp-none leading-5">
                      {step.description}
                    </ItemDescription>
                  </ItemContent>
                </Item>
              </li>
            ))}
          </ol>
        </Card>
      </div>
    </section>
  )
}