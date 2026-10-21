import type { ReactNode } from "react"
import { UserIcon, Building2Icon, CircleDollarSignIcon, LayoutGridIcon, SparklesIcon, RadioIcon, InfoIcon, UsersIcon, FileTextIcon, MegaphoneIcon, GlobeIcon, MailIcon } from "lucide-react"

// ── Types ──

export type NavMegaMenuItem = {
  title: string
  description: string
  href: string
  icon: ReactNode
}

// ── Data ──

export const NAVBAR_PRODUCTS: NavMegaMenuItem[] = [
  {
    title: "Individuals",
    description: "Keep your finances organized.",
    href: "#",
    icon: (
      <UserIcon aria-hidden="true" />
    ),
  },
  {
    title: "LLCs",
    description: "Benefit from tax write-offs.",
    href: "#",
    icon: (
      <Building2Icon aria-hidden="true" />
    ),
  },
  {
    title: "Freelancers",
    description: "For independent workers.",
    href: "#",
    icon: (
      <CircleDollarSignIcon aria-hidden="true" />
    ),
  },
  {
    title: "Investors",
    description: "Make and grow your money.",
    href: "#",
    icon: (
      <LayoutGridIcon aria-hidden="true" />
    ),
  },
  {
    title: "Small businesses",
    description: "We take care of your taxes.",
    href: "#",
    icon: (
      <SparklesIcon aria-hidden="true" />
    ),
  },
  {
    title: "Crypto",
    description: "For tech enthusiasts.",
    href: "#",
    icon: (
      <CircleDollarSignIcon aria-hidden="true" />
    ),
  },
  {
    title: "Enterprise",
    description: "Run your finances at scale.",
    href: "#",
    icon: (
      <Building2Icon aria-hidden="true" />
    ),
  },
  {
    title: "Investments",
    description: "Launch your ideas worldwide.",
    href: "#",
    icon: (
      <RadioIcon aria-hidden="true" />
    ),
  },
]

export const NAVBAR_COMPANIES: NavMegaMenuItem[] = [
  {
    title: "About",
    description: "Our mission and story.",
    href: "#",
    icon: (
      <InfoIcon aria-hidden="true" />
    ),
  },
  {
    title: "Careers",
    description: "Join the team.",
    href: "#",
    icon: (
      <UsersIcon aria-hidden="true" />
    ),
  },
  {
    title: "Blog",
    description: "News and product updates.",
    href: "#",
    icon: (
      <FileTextIcon aria-hidden="true" />
    ),
  },
  {
    title: "Press",
    description: "Media kit and coverage.",
    href: "#",
    icon: (
      <MegaphoneIcon aria-hidden="true" />
    ),
  },
  {
    title: "Partners",
    description: "Programs and integrations.",
    href: "#",
    icon: (
      <GlobeIcon aria-hidden="true" />
    ),
  },
  {
    title: "Contact",
    description: "We are here to help.",
    href: "#",
    icon: (
      <MailIcon aria-hidden="true" />
    ),
  },
]