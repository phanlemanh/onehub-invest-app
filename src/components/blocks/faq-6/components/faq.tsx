import { Frame, FramePanel } from "@/components/reui/frame"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Item, ItemMedia } from "@/components/ui/item"
import { FAQ_ITEMS } from "./data"
import { MessageSquareTextIcon, BookOpenIcon, MailIcon } from "lucide-react"

export function Faq() {
  return (
    <section
      aria-labelledby="faq-6-title"
      className="mx-auto w-full max-w-3xl px-6 py-12 sm:py-14 lg:py-16"
    >
      <div className="flex flex-col gap-3">
        <h2
          id="faq-6-title"
          className="text-foreground text-3xl font-semibold tracking-tight text-balance sm:text-4xl"
        >
          Questions, Answered
        </h2>
        <p className="text-muted-foreground max-w-xl text-base leading-7 text-pretty">
          Practical answers on production use, theming, licensing, and support.
        </p>
      </div>

      <Frame spacing="default" stacked className="mt-6">
        <FramePanel className="px-2 sm:px-4">
          <Accordion
            multiple={false}
            defaultValue={["production-use"]}
            className="gap-0"
          >
            {FAQ_ITEMS.map((item) => (
              <AccordionItem
                key={item.id}
                value={item.id}
                className="border-border/60 border-b last:border-b-0"
              >
                <AccordionTrigger className="items-start gap-4 px-2 py-4 text-left text-base leading-6 font-semibold tracking-tight hover:no-underline [&>svg]:my-auto">
                  <span className="min-w-0">{item.question}</span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground px-2 pb-4 text-base leading-7 text-pretty">
                  <p>{item.answer}</p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </FramePanel>

        <FramePanel className="bg-muted/40 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <Item className="border-background bg-muted [&_svg]:text-accent-foreground flex size-10.5 shrink-0 items-center justify-center border-2 p-0 shadow-[0_1px_3px_0_rgba(0,0,0,0.14)] dark:border [&_svg]:size-5">
              <ItemMedia variant="icon" className="size-auto">
                <MessageSquareTextIcon aria-hidden="true" />
              </ItemMedia>
            </Item>
            <div className="min-w-0">
              <p className="text-foreground text-sm font-semibold">
                Still Have A Question?
              </p>
              <p className="text-muted-foreground text-sm leading-6 text-pretty">
                Bring your edge case to the team and we will map it to one block
                and one owner.
              </p>
            </div>
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-3">
            <Button
              nativeButton={false}
              render={<a href="#" />}
              variant="outline"
              size="sm"
            >
              <BookOpenIcon aria-hidden="true" />
              Read The Docs
            </Button>
            <Button nativeButton={false} render={<a href="#" />} size="sm">
              <MailIcon aria-hidden="true" />
              Contact Support
            </Button>
          </div>
        </FramePanel>
      </Frame>
    </section>
  )
}