import type { ReactNode } from "react"
import { cn } from "cn"

import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
  FieldTitle,
} from "@/components/ui/field"

interface ProfileFieldRowProps {
  title: string
  description?: string
  children: ReactNode
  labelFor?: string
  align?: "center" | "start"
  className?: string
  contentClassName?: string
}

export function ProfileFieldRow({
  title,
  description,
  children,
  labelFor,
  align = "center",
  className,
  contentClassName,
}: ProfileFieldRowProps) {
  return (
    <Field
      orientation="responsive"
      className={cn(
        "gap-3 px-5 py-4 @md/field-group:gap-6",
        align === "start"
          ? "@md/field-group:has-[>[data-slot=field-content]]:items-start"
          : "@md/field-group:has-[>[data-slot=field-content]]:items-center",
        className
      )}
    >
      <div className="flex min-w-0 flex-col gap-0.5 @md/field-group:w-2/5 @md/field-group:basis-2/5 @md/field-group:pr-4">
        {labelFor ? (
          <FieldLabel htmlFor={labelFor}>{title}</FieldLabel>
        ) : (
          <FieldTitle>{title}</FieldTitle>
        )}
        {description ? (
          <FieldDescription className="text-balance">
            {description}
          </FieldDescription>
        ) : null}
      </div>

      <FieldContent
        className={cn(
          "w-full min-w-0 @md/field-group:w-3/5 @md/field-group:basis-3/5",
          contentClassName
        )}
      >
        {children}
      </FieldContent>
    </Field>
  )
}