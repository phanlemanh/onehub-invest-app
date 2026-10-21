"use client"

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import type { ProfileSelectOption } from "./data"

interface ProfileSelectFieldProps {
  id: string
  options: ProfileSelectOption[]
  defaultValue: string
  placeholder?: string
}

export function ProfileSelectField({
  id,
  options,
  defaultValue,
  placeholder = "Select option",
}: ProfileSelectFieldProps) {
  const selectedOption =
    options.find((option) => option.value === defaultValue) ?? options[0]

  return (
    <Select defaultValue={selectedOption} items={options}>
      <SelectTrigger id={id} className="w-full [&_small]:hidden">
        <SelectValue>
          {(item: ProfileSelectOption | null) => item?.label ?? placeholder}
        </SelectValue>
      </SelectTrigger>

      <SelectContent
        align="start"
        alignItemWithTrigger={false}
        className="w-(--anchor-width)"
      >
        <SelectGroup>
          {options.map((option) => (
            <SelectItem
              key={option.value}
              value={option}
              className="[&_svg]:text-primary"
            >
              {option.description ? (
                <span className="flex min-w-0 flex-col items-start gap-px">
                  <span className="truncate font-medium">{option.label}</span>
                  <small className="text-muted-foreground truncate text-xs">
                    {option.description}
                  </small>
                </span>
              ) : (
                option.label
              )}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}