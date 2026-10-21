import { Badge } from "@/components/reui/badge"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"
import { PAGE, PAGE_STATS } from "./data"
import { RouteIcon, SparklesIcon, Settings2Icon, UserIcon, CreditCardIcon, SettingsIcon, GitBranchIcon, Headphones, CodeIcon } from "lucide-react"

export function PageHeader() {
  return (
    <div className="flex flex-col gap-4 px-4 sm:flex-row sm:items-center sm:gap-2 sm:px-6">
      <div className="flex min-w-0 flex-1 flex-col items-start justify-center gap-4 sm:gap-1.5">
        {/* The counts wrap under the title before they ever squeeze it. */}
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-4 sm:gap-y-1.5">
          <h1 className="text-xl font-medium">{PAGE.title}</h1>
          <Separator
            orientation="vertical"
            className="hidden h-3 data-vertical:self-center sm:block"
          />
          <div className="flex items-center gap-1.5">
            {PAGE_STATS.map((stat) => (
              <Badge
                key={stat.id}
                variant="outline"
                size="sm"
                radius="full"
                className="dark:bg-background px-1.5"
              >
                {stat.count} {stat.label}
              </Badge>
            ))}
          </div>
        </div>
        <p className="text-muted-foreground text-xs">{PAGE.description}</p>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <Button size="sm" className="text-xs">
          <RouteIcon data-icon="inline-start" aria-hidden="true" />
          New Mission
        </Button>
        <Button variant="outline" size="sm" className="text-xs shadow-xs">
          <SparklesIcon data-icon="inline-start" aria-hidden="true" />
          Open Chat
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="outline"
                size="icon-sm"
                className="shadow-xs"
                aria-label="Display options"
              />
            }
          >
            <Settings2Icon aria-hidden="true" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" sideOffset={8}>
            <DropdownMenuGroup>
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuItem>
                <UserIcon aria-hidden="true" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem>
                <CreditCardIcon aria-hidden="true" />
                Billing
              </DropdownMenuItem>
              <DropdownMenuItem>
                <SettingsIcon aria-hidden="true" />
                Settings
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <GitBranchIcon aria-hidden="true" />
                GitHub
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Headphones aria-hidden="true" />
                Support
              </DropdownMenuItem>
              <DropdownMenuItem disabled>
                <CodeIcon aria-hidden="true" />
                API
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}