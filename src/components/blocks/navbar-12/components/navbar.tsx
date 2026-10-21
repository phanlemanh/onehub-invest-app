import { NavbarActions } from "./navbar-actions"
import { NavbarRepo } from "./navbar-repo"

// -- Navbar (live code collaboration - repo path, presence, run controls) --

export function Navbar() {
  return (
    <header className="border-border bg-background sticky top-0 z-20 flex h-12 w-full shrink-0 items-center justify-between gap-2 border-b px-4">
      {/* Left - brand + repo path + branch + live status */}
      <NavbarRepo />

      {/* Right - fork, share, terminal, run */}
      <NavbarActions />
    </header>
  )
}