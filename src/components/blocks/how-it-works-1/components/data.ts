export interface HowItWorksStep {
  id: string
  title: string
  description: string
}

/** Rendered in order; the visible numeral is the index, so it never drifts. */
export const HOW_IT_WORKS_STEPS: HowItWorksStep[] = [
  {
    id: "browse",
    title: "Browse the Registry",
    description:
      "Explore curated components, templates, and production-ready blocks.",
  },
  {
    id: "install",
    title: "Install with CLI",
    description:
      "Add components directly using the shadcn-compatible registry.",
  },
  {
    id: "customize",
    title: "Customize Everything",
    description:
      "Adapt styles, layouts, interactions, and behavior to match your product.",
  },
]