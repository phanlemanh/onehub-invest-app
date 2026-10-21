"use client"

import { type ReactNode } from "react"
import { Badge } from "@/components/reui/badge"
import { Rating } from "@/components/reui/rating"
import { cn } from "cn"

import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarImage,
} from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  NOTIFICATIONS,
  type Notification,
  type NotificationGroupMember,
  type NotificationType,
  type NotificationVariant,
} from "./data"
import { MessageSquareIcon, CreditCardIcon, ShieldAlertIcon, RocketIcon, AlertCircleIcon, CircleCheckIcon, ShoppingCartIcon, PackageIcon, StarIcon, TruckIcon, PaperclipIcon, UserPlusIcon, SparklesIcon, ActivityIcon, LinkIcon, ThumbsUpIcon, UsersIcon, SmileIcon, CalendarIcon, DownloadIcon, BellIcon, CheckCheckIcon, XIcon } from "lucide-react"

// ── Notification Type Icons ──

const NOTIFICATION_ICONS: Record<NotificationType, ReactNode> = {
  mention: (
    <MessageSquareIcon aria-hidden="true" />
  ),
  comment: (
    <MessageSquareIcon aria-hidden="true" />
  ),
  billing: (
    <CreditCardIcon aria-hidden="true" />
  ),
  security: (
    <ShieldAlertIcon aria-hidden="true" />
  ),
  deployment: (
    <RocketIcon aria-hidden="true" />
  ),
  system: (
    <AlertCircleIcon aria-hidden="true" />
  ),
  task: (
    <CircleCheckIcon aria-hidden="true" />
  ),
  order: (
    <ShoppingCartIcon aria-hidden="true" />
  ),
  stock: (
    <PackageIcon aria-hidden="true" />
  ),
  review: (
    <StarIcon aria-hidden="true" />
  ),
  shipment: (
    <TruckIcon aria-hidden="true" />
  ),
  share: (
    <PaperclipIcon aria-hidden="true" />
  ),
  invite: (
    <UserPlusIcon aria-hidden="true" />
  ),
  feature: (
    <SparklesIcon aria-hidden="true" />
  ),
  usage: (
    <ActivityIcon aria-hidden="true" />
  ),
  approval: (
    <CircleCheckIcon aria-hidden="true" />
  ),
  integration: (
    <LinkIcon aria-hidden="true" />
  ),
  achievement: (
    <StarIcon aria-hidden="true" />
  ),
  feedback: (
    <ThumbsUpIcon aria-hidden="true" />
  ),
  team_join: (
    <UsersIcon aria-hidden="true" />
  ),
  reaction: (
    <SmileIcon aria-hidden="true" />
  ),
  event: (
    <CalendarIcon aria-hidden="true" />
  ),
}

const VARIANT_COLORS: Record<NotificationVariant, string> = {
  info: "text-info",
  success: "text-success",
  warning: "text-warning",
  destructive: "text-destructive",
}

// ── Notification Avatar Group ──

function NotifAvatarGroup({
  members,
  count,
}: {
  members: NotificationGroupMember[]
  count?: number
}) {
  return (
    <AvatarGroup className="mt-1.5 -space-x-1">
      {members.map((m) => (
        <Avatar key={m.src} className="size-5">
          <AvatarImage src={m.src} alt={m.fallback} />
          <AvatarFallback className="text-[9px]">{m.fallback}</AvatarFallback>
        </Avatar>
      ))}
      {count && count > 0 ? (
        <AvatarGroupCount className="size-5 text-[9px] leading-none">
          +{count}
        </AvatarGroupCount>
      ) : null}
    </AvatarGroup>
  )
}

// ── Segmented Meta Badge ──

function MetaBadge({
  label,
  value,
  color,
}: {
  label: string
  value: string
  color?: string
}) {
  return (
    <span className="border-border/60 inline-flex h-[18px] shrink-0 items-center overflow-hidden rounded-sm border text-[10px] font-medium">
      <span className="bg-muted/60 text-muted-foreground border-border/50 flex h-full items-center border-r px-1.5 leading-none">
        {label}
      </span>
      <span
        className={cn(
          "flex h-full items-center px-1.5 leading-none",
          color || "text-foreground"
        )}
      >
        {value}
      </span>
    </span>
  )
}

// ── Mini Progress Bar ──

function MiniProgress({
  value,
  variant = "default",
}: {
  value: number
  variant?: "default" | "success"
}) {
  const indicatorColor =
    variant === "success"
      ? "**:data-[slot=progress-indicator]:bg-success"
      : value >= 80
        ? "**:data-[slot=progress-indicator]:bg-warning"
        : "**:data-[slot=progress-indicator]:bg-primary"

  return (
    <div className="bg-muted/55 relative mt-1.5 h-1 overflow-hidden rounded-full">
      <div
        className="text-muted-foreground pointer-events-none absolute inset-0 opacity-20"
        aria-hidden="true"
        style={{
          backgroundImage:
            "repeating-linear-gradient(-45deg, currentColor 0, currentColor 1px, transparent 0, transparent 4px)",
        }}
      />
      <Progress
        value={value}
        className={cn(
          "absolute inset-0 gap-0",
          "**:data-[slot=progress-track]:h-full **:data-[slot=progress-track]:rounded-none **:data-[slot=progress-track]:bg-transparent",
          "**:data-[slot=progress-indicator]:rounded-none",
          indicatorColor
        )}
      />
    </div>
  )
}

// ── Notification Item ──

function NotificationItem({ notification }: { notification: Notification }) {
  const {
    type,
    variant = "info",
    title,
    body,
    time,
    avatar,
    username,
    link,
    badge,
    actions,
    attachment,
    meta,
    progress,
    progressVariant,
    avatarGroup,
    avatarGroupCount,
    rating,
    eventDate,
    eventTime,
  } = notification

  const iconColor = VARIANT_COLORS[variant]
  const hasAvatar = Boolean(avatar)
  const hasActions = Boolean(actions?.length)

  const content = (
    <>
      {/* Left column: Avatar or Icon */}
      <div className="shrink-0">
        {hasAvatar ? (
          <Avatar className="size-6">
            <AvatarImage src={avatar?.src} alt={avatar?.fallback} />
            <AvatarFallback className="text-[10px]">
              {avatar?.fallback}
            </AvatarFallback>
          </Avatar>
        ) : (
          <div
            className={cn(
              "flex size-6 items-center justify-center [&_svg]:size-4",
              iconColor
            )}
          >
            {NOTIFICATION_ICONS[type]}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1 space-y-1">
        {/* Title row */}
        <div className="flex items-start justify-between gap-2">
          <p className="text-foreground text-xs leading-snug">
            {username && (
              <span className="text-primary font-medium">{username}</span>
            )}{" "}
            {hasAvatar ? (
              <>
                {title}{" "}
                {link && (
                  <span className="text-primary font-medium">{link}</span>
                )}
              </>
            ) : (
              <span className="font-medium">{title}</span>
            )}
          </p>
          {badge && (
            <Badge variant="outline" size="sm" className="shrink-0">
              {badge}
            </Badge>
          )}
        </div>

        {/* Body */}
        {body && (
          <p className="text-muted-foreground line-clamp-2 text-xs">{body}</p>
        )}

        {/* Avatar group */}
        {avatarGroup && avatarGroup.length > 0 && (
          <NotifAvatarGroup members={avatarGroup} count={avatarGroupCount} />
        )}

        {/* Star rating */}
        {rating !== undefined && (
          <Rating rating={rating} size="sm" className="mt-0.5" />
        )}

        {/* Event date/time chip */}
        {(eventDate || eventTime) && (
          <div className="bg-muted/50 border-border/50 text-muted-foreground mt-1 inline-flex items-center gap-1.5 rounded-sm border px-2 py-1 text-[11px]">
            <CalendarIcon aria-hidden="true" className="size-3 shrink-0 opacity-60" />
            {eventDate && (
              <span className="text-foreground font-medium">{eventDate}</span>
            )}
            {eventTime && <span className="opacity-70">{eventTime}</span>}
          </div>
        )}

        {/* Progress bar */}
        {progress !== undefined && (
          <MiniProgress value={progress} variant={progressVariant} />
        )}

        {/* Attachment */}
        {attachment && (
          <div className="flex items-center gap-1 py-1">
            <ButtonGroup>
              <Button variant="outline" size="xs">
                <PaperclipIcon aria-hidden="true" />
                {attachment.name}
                <span className="opacity-60">({attachment.size})</span>
              </Button>
              <Button variant="outline" size="icon-xs" aria-label="Download">
                <DownloadIcon aria-hidden="true" />
              </Button>
            </ButtonGroup>
          </div>
        )}

        {/* Actions */}
        {hasActions && (
          <div className="flex items-center gap-1 py-1">
            {actions?.map((action) => (
              <Button
                key={action.label}
                size="xs"
                variant={action.variant === "outline" ? "outline" : "default"}
              >
                {action.label}
              </Button>
            ))}
          </div>
        )}

        {/* Timestamp + Meta badge */}
        <div className="flex items-center gap-2 pt-0.5">
          <p className="text-muted-foreground/70 text-[11px] tabular-nums">
            {time}
          </p>
          {meta && (
            <MetaBadge
              label={meta.label}
              value={meta.value}
              color={meta.color}
            />
          )}
        </div>
      </div>
    </>
  )

  return (
    <div className="relative">
      <div className={cn("flex w-full items-start gap-2 px-4 py-2 text-left")}>
        {content}
      </div>
    </div>
  )
}

// ── Notifications Drawer ──

export function NotificationsDrawer({ className }: { className?: string }) {
  const unreadCount = NOTIFICATIONS.filter((n) => n.unread).length

  return (
    <Sheet>
      <SheetTrigger
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Notifications"
            className={cn("text-muted-foreground", className)}
          />
        }
      >
        <BellIcon aria-hidden="true" />
      </SheetTrigger>
      <SheetContent
        side="right"
        showCloseButton={false}
        // Without this the drawer auto-focuses its first action, a tooltip
        // trigger, and pops that tooltip on every open.
        initialFocus={false}
        className="flex w-full flex-col gap-0 p-0 sm:w-96"
      >
        <SheetHeader className="border-b px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <SheetTitle className="text-sm">Notifications</SheetTitle>
              {unreadCount > 0 && (
                <Badge size="xs" className="rounded-full!">
                  {unreadCount}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-0.5">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label="Mark all as read"
                      />
                    }
                  >
                    <CheckCheckIcon className="size-3.5" aria-hidden="true" />
                  </TooltipTrigger>
                  <TooltipContent>Mark all as read</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <SheetClose
                render={
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Close notifications"
                  />
                }
              >
                <XIcon className="size-3.5" aria-hidden="true" />
              </SheetClose>
            </div>
          </div>
          <SheetDescription className="sr-only">
            View and manage your notifications
          </SheetDescription>
        </SheetHeader>

        {/* Notifications list. The edge fade marks overflow under the hidden
            bar; scroll-py-10 = its 40px cap, so focused rows stay clear. */}
        <div className="no-scrollbar scroll-fade-y min-h-0 grow scroll-py-10 overflow-y-auto [--scroll-fade-reveal:--spacing(8)]">
          <div className="flex flex-col">
            {NOTIFICATIONS.map((notification, idx) => (
              <div key={notification.id}>
                <NotificationItem notification={notification} />
                {idx < NOTIFICATIONS.length - 1 && (
                  <Separator className="opacity-60" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* View all notifications button */}
        <div className="border-t px-3 py-2">
          <Button variant="ghost" size="sm" className="w-full font-normal">
            View all notifications
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}