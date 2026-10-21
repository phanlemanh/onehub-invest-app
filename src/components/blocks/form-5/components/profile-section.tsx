import type { ReactNode } from "react"
import { cn } from "cn"

import { Card, CardContent, CardFooter } from "@/components/ui/card"

interface ProfileSectionProps {
  title: string
  description: string
  children: ReactNode
  action?: ReactNode
  footer?: ReactNode
  className?: string
  contentClassName?: string
  footerClassName?: string
}

export function ProfileSection({
  title,
  description,
  children,
  action,
  footer,
  className,
  contentClassName,
  footerClassName,
}: ProfileSectionProps) {
  return (
    <section className={cn("flex flex-col gap-3", className)}>
      {/* Heading */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex min-w-0 flex-col gap-0.5">
          <h2 className="text-base font-semibold">{title}</h2>
          <p className="text-muted-foreground text-sm">{description}</p>
        </div>
        {action ? (
          <div className="flex w-full shrink-0 justify-end sm:ml-auto sm:w-auto">
            {action}
          </div>
        ) : null}
      </div>

      {/* Card */}
      <Card className="gap-0 p-0">
        <CardContent className={cn("p-0", contentClassName)}>
          {children}
        </CardContent>
        {footer ? (
          <CardFooter className={cn("border-t px-5 py-3", footerClassName)}>
            {footer}
          </CardFooter>
        ) : null}
      </Card>
    </section>
  )
}