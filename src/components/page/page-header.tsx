"use client"

import type { ReactNode } from "react"
import Link from "next/link"

import { Badge } from "@/components/reui/badge"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"

export type Crumb = { label: string; href?: string }

/**
 * Page header dùng chung — chuyển thể từ page-header của @reui/app-shell-30:
 * tiêu đề + badge đếm + mô tả + nút. Thêm breadcrumb (IA L1) phía trên tiêu đề.
 */
export function PageHeader({
  crumbs,
  title,
  stats,
  description,
  actions,
}: {
  crumbs: Crumb[]
  title: string
  stats: string[]
  description: string
  /** Nút bên phải (Lưu, Bản đồ, Mở trên Airbnb…). */
  actions?: ReactNode
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:gap-2">
      <div className="flex min-w-0 flex-1 flex-col items-start justify-center gap-3">
        <Breadcrumb>
          <BreadcrumbList>
            {crumbs.map((crumb, index) => (
              <BreadcrumbItemGroup key={crumb.label} crumb={crumb} last={index === crumbs.length - 1} />
            ))}
          </BreadcrumbList>
        </Breadcrumb>
        <div className="flex min-w-0 flex-col items-start gap-1.5">
          {/* The counts wrap under the title before they ever squeeze it. */}
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-2">
            <h1 className="text-xl font-medium">{title}</h1>
            <Separator
              orientation="vertical"
              className="hidden h-3 data-vertical:self-center sm:block"
            />
            <div className="flex flex-wrap items-center gap-1.5">
              {stats.map((stat) => (
                <Badge
                  key={stat}
                  variant="outline"
                  size="sm"
                  radius="full"
                  className="dark:bg-background px-1.5"
                >
                  {stat}
                </Badge>
              ))}
            </div>
          </div>
          <p className="text-muted-foreground text-xs">{description}</p>
        </div>
      </div>

      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  )
}

function BreadcrumbItemGroup({ crumb, last }: { crumb: Crumb; last: boolean }) {
  return (
    <>
      <BreadcrumbItem>
        {last || !crumb.href ? (
          <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
        ) : (
          <BreadcrumbLink render={<Link href={crumb.href} />}>{crumb.label}</BreadcrumbLink>
        )}
      </BreadcrumbItem>
      {!last && <BreadcrumbSeparator />}
    </>
  )
}
