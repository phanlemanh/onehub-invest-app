import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"

import { WORKSPACE_TABS } from "./data"
import { WorkspaceContent } from "./workspace-content"

// The track's hairline is an inset ring, not a border: a border eats 1px off
// the content box, so an h-full trigger would sit 2px shorter than its track.
const TAB_LIST = "bg-input/30 inset-ring-ring/20 h-7 shrink-0 p-0 inset-ring"

// border-0 drops the 1px transparent border the trigger ships, which would
// otherwise widen the track by 2px per tab.
const TAB_TRIGGER =
  "text-muted-foreground h-full flex-none border-0 px-2.5 py-0.5 text-xs data-active:shadow-xs data-active:inset-ring data-active:inset-ring-ring/50 dark:data-active:bg-background dark:data-active:inset-ring-ring/30"

interface WorkspaceTabsProps {
  view: string
  onSelectView: (view: string) => void
}

export function WorkspaceTabs({ view, onSelectView }: WorkspaceTabsProps) {
  return (
    <Tabs
      value={view}
      onValueChange={onSelectView}
      className="flex flex-1 flex-col gap-4 sm:gap-6"
    >
      {/* Below md the track is a drawer reached from the bar, so the row leaves
          with it instead of holding an empty band above the panel. */}
      <div className="flex px-4 max-md:hidden sm:px-6">
        <TabsList aria-label="Workspace views" className={TAB_LIST}>
          {WORKSPACE_TABS.map((item) => (
            <TabsTrigger key={item.id} value={item.id} className={TAB_TRIGGER}>
              {item.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>

      {/* The page panel. It clips its own rounded top rather than nesting a
          second frame, whose ring the panel's own ground painted over anyway. */}
      <div className="bg-background inset-ring-ring/20 flex flex-1 flex-col overflow-clip rounded-t-xl px-4 py-4 inset-ring sm:px-6 sm:py-6">
        {/* Each tab needs its own panel to be selectable; only the active one
              mounts, so the shared placeholder body is never duplicated. */}
        {WORKSPACE_TABS.map((item) => (
          <TabsContent key={item.id} value={item.id} className="flex flex-1">
            <WorkspaceContent />
          </TabsContent>
        ))}
      </div>
    </Tabs>
  )
}