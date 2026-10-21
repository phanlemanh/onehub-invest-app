export function MarketingHero() {
  return (
    <div className="flex max-w-xl flex-col gap-7 sm:gap-8">
      <div className="border-border/60 bg-background/80 text-foreground/70 inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1 text-sm font-medium tracking-tight backdrop-blur-sm">
        <span className="bg-primary size-1.5 rounded-full" aria-hidden="true" />
        <span>Global product teams ship on ReUI</span>
      </div>
      <h1 className="text-foreground text-4xl leading-[1.02] font-semibold tracking-[-0.02em] text-balance sm:text-5xl lg:text-[56px]">
        The UI layer to grow your{" "}
        <span className="bg-gradient-to-r from-orange-500 via-pink-500 to-violet-500 bg-clip-text text-transparent">
          product
        </span>
        .
      </h1>
      <p className="text-muted-foreground max-w-xl text-base leading-relaxed text-pretty sm:text-lg">
        A premium block library built on shadcn. Auth, billing, dashboards, and
        settings. Production-ready the day you clone it.
      </p>
    </div>
  )
}