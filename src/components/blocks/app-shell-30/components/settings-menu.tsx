import { useState } from "react"
import { cn } from "cn"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SettingsIcon, BotIcon, Building2Icon, BellIcon } from "lucide-react"

export function SettingsMenu({ className }: { className?: string }) {
  const [ops, setOps] = useState({
    autoDispatch: true,
    lowBatteryReturn: true,
    maintenanceMode: false,
  })

  function toggleOp(key: keyof typeof ops) {
    setOps((current) => ({ ...current, [key]: !current[key] }))
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            className={cn("text-muted-foreground", className)}
            aria-label="Open settings"
          />
        }
      >
        <SettingsIcon aria-hidden="true" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={8} className="w-60">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Settings</DropdownMenuLabel>
          <DropdownMenuItem>
            <BotIcon aria-hidden="true" />
            Fleet Settings
            <DropdownMenuShortcut>⌘,</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Building2Icon aria-hidden="true" />
            Station Defaults
          </DropdownMenuItem>
          <DropdownMenuItem>
            <BellIcon aria-hidden="true" />
            Alert Rules
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuLabel>Operations</DropdownMenuLabel>
          {/* Toggles set a value in place, so the menu outlives each click. */}
          <DropdownMenuCheckboxItem
            checked={ops.autoDispatch}
            closeOnClick={false}
            onCheckedChange={() => toggleOp("autoDispatch")}
          >
            Auto-Dispatch
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={ops.lowBatteryReturn}
            closeOnClick={false}
            onCheckedChange={() => toggleOp("lowBatteryReturn")}
          >
            Low-Battery Return
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={ops.maintenanceMode}
            closeOnClick={false}
            onCheckedChange={() => toggleOp("maintenanceMode")}
          >
            Maintenance Mode
          </DropdownMenuCheckboxItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}