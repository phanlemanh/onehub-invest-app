import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { WORKSPACE_TABS } from "./data"
import { LayersIcon } from "lucide-react"

// The bar's other menu sets its row the same way, so the pair reads as one
// control: a wash on the set row, a half-strength one under the cursor.
const ROW =
  "data-checked:bg-accent data-highlighted:bg-accent/50 pr-1.5 **:data-[slot=dropdown-menu-radio-item-indicator]:hidden"

interface ViewsMenuProps {
  view: string
  onSelectView: (view: string) => void
}

// Eight tab labels never fit a phone. The stand-in opens the same way as the
// sections menu beside it, so the pair reads as one control, not two.
export function ViewsMenu({ view, onSelectView }: ViewsMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            // The tab track takes over at md, so its stand-in stops there.
            className="text-muted-foreground md:hidden"
            aria-label="Workspace views"
          />
        }
      >
        <LayersIcon aria-hidden="true" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" sideOffset={8} className="w-44">
        <DropdownMenuRadioGroup value={view} onValueChange={onSelectView}>
          {WORKSPACE_TABS.map((item) => (
            <DropdownMenuRadioItem
              key={item.id}
              value={item.id}
              closeOnClick
              className={ROW}
            >
              {item.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}