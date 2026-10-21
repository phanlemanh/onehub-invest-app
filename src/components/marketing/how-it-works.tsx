"use client"

import Link from "next/link"
import { ArrowUpRightIcon, BookOpenIcon, MapIcon, SparklesIcon } from "lucide-react"

import { Badge } from "@/components/reui/badge"
import { Frame, FramePanel } from "@/components/reui/frame"
import { IconTile } from "@/components/reui/icon-tile"
import { Button } from "@/components/ui/button"
import { Item, ItemContent, ItemDescription, ItemTitle } from "@/components/ui/item"

const STEPS = [
  { id: "tim", title: "Tìm thị trường", description: "Xếp hạng phường theo RevPAR, công suất, giá — cùng màu trên bản đồ." },
  { id: "phan-tich", title: "Phân tích phường và listing", description: "Insight từng phường, so với phường cùng cấp; duyệt listing trên bản đồ nhãn giá." },
  { id: "uoc-tinh", title: "Ước tính lợi suất", description: "Một căn cụ thể: doanh thu ngắn hạn, chi phí, so với cho thuê dài hạn." },
]

/**
 * Cách dùng — chuyển thể từ @reui/how-it-works-1. Khác bản gốc: Card → Frame
 * (trang chủ dùng họ Frame), nội dung 3 bước của One Invest.
 */
export function HowItWorks() {
  return (
    <section aria-labelledby="how-title" className="w-full px-4 py-12 sm:px-6 lg:px-8">
      <div className="@container mx-auto w-full max-w-7xl">
        <Frame spacing="lg" stacked>
          <FramePanel className="grid gap-8 @3xl:grid-cols-[1fr_auto] @3xl:items-end">
            <div className="flex min-w-0 flex-col items-start gap-4">
              <Badge
                variant="outline"
                size="xl"
                radius="full"
                render={<Link href="/phuong-phap" />}
                className="text-foreground hover:bg-accent h-7 transition-colors [&_svg]:size-3.5!"
              >
                <SparklesIcon aria-hidden="true" />
                Cách số liệu được tính
                <ArrowUpRightIcon aria-hidden="true" />
              </Badge>
              <h2 id="how-title" className="text-3xl font-semibold @xl:text-4xl">
                Từ thị trường đến một căn
              </h2>
              <p className="text-muted-foreground max-w-[40rem] text-base">
                Ba bước, cùng một nguồn số liệu: lịch đặt Airbnb tự thu thập, gán vào phường theo toạ độ.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-2 @3xl:w-80 @3xl:justify-end">
              <Button variant="outline" size="lg" nativeButton={false} render={<Link href="/phuong-phap" />}>
                <BookOpenIcon data-icon="inline-start" aria-hidden="true" />
                Phương pháp
              </Button>
              <Button size="lg" nativeButton={false} render={<Link href="/vn" />}>
                <MapIcon data-icon="inline-start" aria-hidden="true" />
                Xem thị trường
              </Button>
            </div>
          </FramePanel>
          <FramePanel className="p-0">
            <ol role="list" className="-mx-px grid grid-cols-1 @4xl:grid-cols-3">
              {STEPS.map((step, index) => (
                <li key={step.id} className="border-border min-w-0 border-l p-3 max-@4xl:border-t max-@4xl:first:border-t-0">
                  <Item className="border-0">
                    <IconTile variant="frame" className="bg-primary/5 self-start border-0 [--icon-tile-inset:--spacing(1)]">
                      <span aria-hidden="true" className="text-base font-medium">
                        {index + 1}
                      </span>
                    </IconTile>
                    <ItemContent className="gap-px">
                      <ItemTitle className="line-clamp-none leading-5">{step.title}</ItemTitle>
                      <ItemDescription className="line-clamp-none leading-5">{step.description}</ItemDescription>
                    </ItemContent>
                  </Item>
                </li>
              ))}
            </ol>
          </FramePanel>
        </Frame>
      </div>
    </section>
  )
}
