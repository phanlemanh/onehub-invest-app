"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { ProfileAction } from "./data"
import { EllipsisVerticalIcon } from "lucide-react"

interface ProfileActionMenuProps {
  label: string
  actions: ProfileAction[]
  buttonVariant?: "outline" | "ghost"
}

export function ProfileActionMenu({
  label,
  actions,
  buttonVariant = "outline",
}: ProfileActionMenuProps) {
  const defaultActions = actions.filter(
    (action) => action.variant !== "destructive"
  )
  const destructiveActions = actions.filter(
    (action) => action.variant === "destructive"
  )

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            type="button"
            variant={buttonVariant}
            size="icon-sm"
            aria-label={label}
          >
            <EllipsisVerticalIcon aria-hidden="true" />
          </Button>
        }
      />

      {/* Content */}
      <DropdownMenuContent align="end" className="min-w-48">
        <DropdownMenuGroup>
          {defaultActions.map((action) => (
            <DropdownMenuItem key={action.id}>
              {action.icon}
              {action.label}
            </DropdownMenuItem>
          ))}

          {destructiveActions.length > 0 ? <DropdownMenuSeparator /> : null}

          {destructiveActions.map((action) => (
            <DropdownMenuItem key={action.id} variant="destructive">
              {action.icon}
              {action.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}