"use client"

import { useState } from "react"

import { DEFAULT_TAB } from "./data"
import { PageHeader } from "./page-header"
import { TopBar } from "./top-bar"
import { WorkspaceTabs } from "./workspace-tabs"

export function AppShell() {
  const [section, setSection] = useState("overview")
  // The view lives here because a phone reaches it from the bar and a desktop
  // from the tab track, and both must move the same panel.
  const [view, setView] = useState(DEFAULT_TAB)

  return (
    <div className="bg-background text-foreground flex h-svh w-full flex-col">
      {/* Nothing is pinned: the bar scrolls with the page, and the shell only
          scrolls once its body outgrows the viewport. */}
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
        <div className="flex min-h-full w-full flex-col">
          <TopBar
            section={section}
            onSelectSection={setSection}
            view={view}
            onSelectView={setView}
          />

          {/* One framed page panel. The phone top inset is short because the
              title's leading already adds ~6px above its cap. */}
          <div className="inset-ring-ring/20 flex min-h-0 flex-1 flex-col gap-4 rounded-xl pt-2.5 inset-ring sm:gap-6 sm:pt-6">
            <PageHeader />
            <WorkspaceTabs view={view} onSelectView={setView} />
          </div>
        </div>
      </div>
    </div>
  )
}