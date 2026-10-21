import { Badge } from "@/components/reui/badge"

import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import type { ProfileAccountRow as ProfileAccountRowData } from "./data"
import { ProfileActionMenu } from "./profile-action-menu"
import { CircleCheckIcon } from "lucide-react"

export function ProfileAccountRow({
  account,
}: {
  account: ProfileAccountRowData
}) {
  return (
    <Item size="sm" className="px-5">
      {/* Media */}
      <ItemMedia variant="icon">{account.icon}</ItemMedia>

      {/* Content */}
      <ItemContent className="min-w-0">
        <ItemTitle className="w-full min-w-0 flex-wrap gap-2">
          <span className="min-w-0 truncate">{account.label}</span>
          {account.badge ? (
            <Badge variant={account.badge.variant}>{account.badge.label}</Badge>
          ) : null}
          {account.verification ? (
            <Tooltip>
              <TooltipTrigger
                render={
                  <button
                    type="button"
                    className="text-muted-foreground hover:text-foreground focus-visible:ring-ring focus-visible:ring-offset-background inline-flex shrink-0 rounded-sm align-middle focus-visible:ring-2 focus-visible:ring-offset-2"
                    aria-label={`${account.label} verification details`}
                  />
                }
              >
                <CircleCheckIcon className="text-success size-4" aria-hidden="true" />
              </TooltipTrigger>
              <TooltipContent className="max-w-72 p-3">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between gap-4">
                    <span className="font-medium">Verification</span>
                    <span className="text-success text-xs font-medium">
                      {account.verification.badgeLabel}
                    </span>
                  </div>
                  <p className="text-xs opacity-80">
                    {account.verification.description}
                  </p>
                  <div className="grid gap-1 text-xs">
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-muted-foreground">Source</span>
                      <span className="font-medium">
                        {account.verification.source}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-muted-foreground">Status</span>
                      <span className="font-medium">
                        {account.verification.updatedAt}
                      </span>
                    </div>
                  </div>
                </div>
              </TooltipContent>
            </Tooltip>
          ) : null}
        </ItemTitle>
        <ItemDescription className="truncate">
          {account.description}
        </ItemDescription>
      </ItemContent>

      {/* Actions */}
      <ItemActions className="shrink-0 gap-3">
        {account.meta ? (
          <span className="text-muted-foreground hidden text-xs whitespace-nowrap sm:inline">
            {account.meta}
          </span>
        ) : null}
        <ProfileActionMenu
          label={`Open actions for ${account.label}`}
          actions={account.actions}
          buttonVariant="ghost"
        />
      </ItemActions>
    </Item>
  )
}