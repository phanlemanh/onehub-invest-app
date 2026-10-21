import { Button } from "@/components/ui/button"
import { ArrowRightIcon } from "lucide-react"

// ── Navbar actions (share, terminal, run, overflow) ──

export function NavbarActions() {
  return (
    <div className="flex items-center">
      <Button className="group/sliding relative overflow-hidden px-6">
        <span className="inline-flex items-center transition-transform duration-300 group-hover/sliding:-translate-x-2">
          Get Started
        </span>
        <ArrowRightIcon aria-hidden="true" className="absolute right-2.5 translate-x-8 opacity-0 transition-all duration-300 group-hover/sliding:translate-x-0 group-hover/sliding:opacity-100" />
      </Button>
    </div>
  )
}