export interface FaqItem {
  id: string
  question: string
  answer: string
}

export const FAQ_ITEMS: FaqItem[] = [
  {
    id: "production-use",
    question: "Are ReUI Blocks Ready For Production?",
    answer:
      "Yes. Each block ships as a finished React surface with responsive layout, focus states, and overflow handling already reviewed. Most teams paste a block into an existing route, swap the demo data for their model, and tighten the copy before launch.",
  },
  {
    id: "customize-primitives",
    question: "Can We Customize The shadcn Primitives?",
    answer:
      "Every block is a source-owned composition built on shadcn and ReUI primitives. You can edit structure, props, interaction details, and content directly in your project, so changes never wait on a vendor roadmap.",
  },
  {
    id: "theming-tokens",
    question: "How Do Blocks Pick Up Our Theme Tokens?",
    answer:
      "Blocks read theme tokens for color, radius, and density instead of hard-coded palette values. Point the tokens at your brand, and the same surface carries your styling across light and dark mode without per-component overrides.",
  },
  {
    id: "licensing",
    question: "What Does A Pro License Include?",
    answer:
      "A Pro license covers the full block catalog, every source file, future block additions, and the implementation notes that show how each surface is composed. A team license lets your designers and engineers reuse the patterns across products.",
  },
  {
    id: "updates",
    question: "How Do Updates Reach Our Codebase?",
    answer:
      "Updates arrive as new source you can read before adopting. Because each block lives inside your repository, nothing overwrites your work. You pull a revision intentionally when a pattern or primitive improves.",
  },
  {
    id: "support",
    question: "Where Do We Get Implementation Help?",
    answer:
      "Start with the docs and the notes attached to each block. When a team needs help choosing a pattern or debugging an integration detail, support can point you to the exact source files that matter.",
  },
]