"use client"

import type { ReactNode } from "react"
import { MessageSquareTextIcon } from "lucide-react"

import { Frame, FramePanel } from "@/components/reui/frame"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Item, ItemMedia } from "@/components/ui/item"

export type FaqItem = { id: string; question: string; answer: ReactNode }

/**
 * Hỏi đáp / định nghĩa — chuyển thể Faq của @reui/faq-6: tiêu đề, accordion
 * trong Frame, panel chân (tuỳ chọn). Dữ liệu qua props để dùng cho cả trang
 * chủ lẫn các mục của trang Phương pháp.
 */
export function FaqSection({
  id,
  title,
  description,
  items,
  defaultOpen,
  footer,
}: {
  id: string
  title: string
  description?: string
  items: FaqItem[]
  defaultOpen?: string
  footer?: { title: string; text: string; actions?: ReactNode }
}) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="mx-auto w-full max-w-3xl scroll-mt-20">
      <div className="flex flex-col gap-3">
        <h2 id={`${id}-title`} className="text-foreground text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
          {title}
        </h2>
        {description && (
          <p className="text-muted-foreground max-w-xl text-base leading-7 text-pretty">{description}</p>
        )}
      </div>

      <Frame spacing="default" stacked className="mt-6">
        <FramePanel className="px-2 sm:px-4">
          <Accordion multiple={false} defaultValue={defaultOpen ? [defaultOpen] : []} className="gap-0">
            {items.map((item) => (
              <AccordionItem key={item.id} value={item.id} className="border-border/60 border-b last:border-b-0">
                <AccordionTrigger className="items-start gap-4 px-2 py-4 text-left text-base leading-6 font-semibold tracking-tight hover:no-underline [&>svg]:my-auto">
                  <span className="min-w-0">{item.question}</span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground px-2 pb-4 text-base leading-7 text-pretty">
                  {typeof item.answer === "string" ? <p>{item.answer}</p> : item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </FramePanel>

        {footer && (
          <FramePanel className="bg-muted/40 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <Item className="border-background bg-muted [&_svg]:text-accent-foreground flex size-10.5 shrink-0 items-center justify-center border-2 p-0 shadow-[0_1px_3px_0_rgba(0,0,0,0.14)] dark:border [&_svg]:size-5">
                <ItemMedia variant="icon" className="size-auto">
                  <MessageSquareTextIcon aria-hidden="true" />
                </ItemMedia>
              </Item>
              <div className="min-w-0">
                <p className="text-foreground text-sm font-semibold">{footer.title}</p>
                <p className="text-muted-foreground text-sm leading-6 text-pretty">{footer.text}</p>
              </div>
            </div>
            {footer.actions && <div className="flex shrink-0 flex-wrap items-center gap-3">{footer.actions}</div>}
          </FramePanel>
        )}
      </Frame>
    </section>
  )
}
