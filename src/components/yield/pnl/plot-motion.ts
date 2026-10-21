import { type Period } from "./data"

const OUT = "cubic-bezier(0.23, 1, 0.32, 1)"
const IN_OUT = "cubic-bezier(0.77, 0, 0.175, 1)"

/** The reveal: columns rise in date order as the margin line draws across. */
const RISE_MS = 420
const SWEEP_MS = 320
const STAGGER_MAX_MS = 40
export const EXPENSE_LAG_MS = 50
const DRAW_DELAY_MS = 120
const DRAW_MS = 640
const LAND_DELAY_MS = DRAW_DELAY_MS + DRAW_MS - 80
const FADE_DELAY_MS = 200
/** Past this from the reveal's start, every reveal animation has landed. */
export const REVEAL_MS = 1000

/** Under 300ms, eased in and out: every bar is already on screen. */
const MORPH_MS = 280
/** An entering bar waits for the slides to clear its slot, ending with them. */
const ENTER_DELAY_MS = 80
const FADE_OUT_MS = 160
const FADE_IN_MS = 220
const FADE_IN_DELAY_MS = 60
/** A bar laid out again this soon after a regroup morphs; later, it snaps. */
const MORPH_WINDOW_MS = 600

/** Reduced motion keeps a short fade and drops the movement. */
export const PLOT_STYLE = `
@keyframes chart-36-rise { from { transform: scaleY(0); } }
@keyframes chart-36-draw { from { clip-path: inset(0 100% 0 0); } }
@keyframes chart-36-land { from { opacity: 0; transform: scale(0.6); } }
@keyframes chart-36-fade { from { opacity: 0; } }
[data-chart-36-rise] { animation: chart-36-rise ${RISE_MS}ms ${OUT} var(--chart-36-delay, 0ms) backwards; }
[data-chart-36-draw] { animation: chart-36-draw ${DRAW_MS}ms ${IN_OUT} ${DRAW_DELAY_MS}ms backwards; }
[data-chart-36-land] { animation: chart-36-land 200ms ${OUT} ${LAND_DELAY_MS}ms backwards; transform-box: fill-box; transform-origin: center; }
[data-chart-36-fade] { animation: chart-36-fade 240ms ${OUT} ${FADE_DELAY_MS}ms backwards; }
@media (prefers-reduced-motion: reduce) {
  :is([data-chart-36-rise], [data-chart-36-draw], [data-chart-36-land], [data-chart-36-fade]) { animation: chart-36-fade 200ms ${OUT} backwards; }
}
[data-chart-36-settled] :is([data-chart-36-rise], [data-chart-36-draw], [data-chart-36-land], [data-chart-36-fade]) { animation: none; }
[data-chart-36-reading] [data-chart-36-col]:not([data-chart-36-lit]) { opacity: 0.3; }
:is([data-chart-36-band], [data-chart-36-dot]):not([data-chart-36-lit]) { opacity: 0; }
`

/** The delay between two columns' rises: 4 to 12 columns share one sweep. */
export const staggerOf = (count: number) =>
  Math.min(STAGGER_MAX_MS, SWEEP_MS / Math.max(1, count - 1))

/** The mount's own frame runs long, so the reveal starts on the first frame
 *  that follows its predecessor within this, or after a few frames. */
const SMOOTH_FRAME_MS = 50
const MAX_WAIT_FRAMES = 6
const FALLBACK_MS = 1000

/** Calls back with the time of the first smooth frame after this one. */
export function onSmoothFrame(start: (at: number) => void) {
  let started = false
  let last: number | undefined
  let frames = 0
  const fire = (at: number) => {
    if (started) return
    started = true
    start(at)
  }
  const tick = (at: number) => {
    frames += 1
    const smooth = last !== undefined && at - last < SMOOTH_FRAME_MS
    if (smooth || frames >= MAX_WAIT_FRAMES) return fire(at)
    last = at
    requestAnimationFrame(tick)
  }
  requestAnimationFrame(tick)
  window.setTimeout(() => fire(performance.now()), FALLBACK_MS)
}

export type Box = { x: number; y: number; width: number; height: number }

/** The last layout's bars, kept for the regroup that replaces them. */
export type Morph = { at: number; from: Map<string, Box>; reduce: boolean }

/** A bar's identity across layouts: its series and the months it covers. */
export const barId = (series: string, start: number, months: number) =>
  `${series}:${start}:${months}`

/** The old layer that fades out above the new layout. */
const FADING = "[data-chart-36-lane], .recharts-cartesian-axis-tick-labels"

function boxOf(node: Element, origin: DOMRect): Box {
  const rect = node.getBoundingClientRect()
  return {
    x: rect.left - origin.left,
    y: rect.top - origin.top,
    width: rect.width,
    height: rect.height,
  }
}

/** Whether a new bar grows from this old one: the same months, or the
 *  middle month of the quarter it joins. */
function continues(next: Period[], start: number, months: number) {
  return next.some(
    (row) =>
      (row.start === start && row.months === months) ||
      (months === 1 &&
        row.months > 1 &&
        row.start + Math.floor(row.months / 2) === start)
  )
}

/** A still copy of an element as it looks now, mid-animation included,
 *  stripped of the hooks that would animate or light it again. Reads only. */
function freeze(node: Element) {
  const copy = node.cloneNode(true)
  if (!(copy instanceof SVGElement)) return null
  const live = [node, ...node.querySelectorAll("*")]
  const still = [copy, ...copy.querySelectorAll("*")]
  live.forEach((source, index) => {
    const target = still[index]
    if (!(target instanceof SVGElement)) return
    const hooks = target
      .getAttributeNames()
      .filter((name) => name.startsWith("data-chart-36-"))
    // Only the block's own hooked elements ever carry a transform.
    if (hooks.length > 0) {
      const { transform } = getComputedStyle(source)
      if (transform !== "none") target.style.transform = transform
    }
    for (const name of hooks) target.removeAttribute(name)
  })
  // Out of the fade-in's reach, which finds the live axis labels by class.
  copy.classList.remove("recharts-cartesian-axis-tick-labels")
  return copy
}

function fadeOut(layer: SVGGElement, copy: SVGElement, blur: boolean) {
  layer.append(copy)
  // The blur blends the outgoing line into the incoming one.
  const frames = blur
    ? [
        { opacity: 1, filter: "blur(0px)" },
        { opacity: 0, filter: "blur(2px)" },
      ]
    : [{ opacity: 1 }, { opacity: 0 }]
  copy
    .animate(frames, { duration: FADE_OUT_MS, easing: OUT, fill: "forwards" })
    .finished.then(
      () => copy.remove(),
      () => copy.remove()
    )
}

/** Measures every bar where it stands, and fades out a copy of each old bar
 *  no new one grows from, of the margin lane and of the axis labels. */
export function captureMorph(
  svg: SVGSVGElement,
  layer: SVGGElement,
  next: Period[]
): Morph {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
  // A regroup mid-morph starts over from what is on screen now.
  layer.replaceChildren()
  // Every read first, then every write, so the page lays out once.
  const origin = svg.getBoundingClientRect()
  const from = new Map<string, Box>()
  const leaving: { copy: SVGElement; blur: boolean }[] = []
  for (const bar of svg.querySelectorAll("[data-chart-36-bar]")) {
    const id = bar.getAttribute("data-chart-36-bar") ?? ""
    const [, start, months] = id.split(":").map(Number)
    from.set(id, boxOf(bar, origin))
    const copy = continues(next, start, months) ? null : freeze(bar)
    if (copy) leaving.push({ copy, blur: false })
  }
  for (const group of svg.querySelectorAll(FADING)) {
    const copy = freeze(group)
    const blur = !reduce && group.hasAttribute("data-chart-36-lane")
    if (copy) leaving.push({ copy, blur })
  }
  for (const { copy, blur } of leaving) fadeOut(layer, copy, blur)
  return { at: performance.now(), from, reduce }
}

const live = (morph: Morph | null): morph is Morph =>
  morph !== null && performance.now() - morph.at < MORPH_WINDOW_MS

/** Where a new bar was: itself, the middle month its quarter absorbed, or
 *  the quarter it split from. */
export function sourceOf(
  morph: Morph | null,
  series: string,
  row: Period
): Box | undefined {
  if (!morph) return undefined
  const { from } = morph
  return (
    from.get(barId(series, row.start, row.months)) ??
    (row.months > 1
      ? from.get(barId(series, row.start + Math.floor(row.months / 2), 1))
      : from.get(barId(series, row.start - (row.start % 3), 3)))
  )
}

/** Each bar's running morph, kept here: asking the element for its
 *  animations, or measuring it, would flush style once per bar. */
type Flip = { from: Box; to: Box; animation: Animation }
const flips = new WeakMap<Element, Flip>()

const lerp = (a: number, b: number, t: number) => a + (b - a) * t

/** Where a morphing bar is now, from its eased progress: the slide is
 *  linear in its box, so no layout read is needed. */
function boxNow({ from, to, animation }: Flip): Box {
  const t = animation.effect?.getComputedTiming().progress ?? 0
  return {
    x: lerp(from.x, to.x, t),
    y: lerp(from.y, to.y, t),
    width: lerp(from.width, to.width, t),
    height: lerp(from.height, to.height, t),
  }
}

/** Slides and scales a bar from its source box into its new one, or grows
 *  it from the zero line when it has none. Transform only. */
export function morphBar(
  node: SVGGElement,
  morph: Morph | null,
  to: Box,
  source: Box | undefined
) {
  if (!live(morph) || to.width <= 0 || to.height <= 0) return
  const running = flips.get(node)
  // Interrupted mid-slide, or laid out again by Recharts' second pass, it
  // carries on from where it is.
  const current =
    running?.animation.playState === "running" ? boxNow(running) : source
  running?.animation.cancel()
  if (morph.reduce) {
    const fade = [{ opacity: 0 }, { opacity: 1 }]
    node.animate(fade, { duration: FADE_IN_MS, easing: OUT })
    return
  }
  // With nothing to come from, it grows out of the zero line.
  const from = current ?? { ...to, y: to.y + to.height, height: 0 }
  const scaleX = from.width / to.width
  const scaleY = Math.max(from.height / to.height, 0.001)
  const dx = from.x - scaleX * to.x
  const dy = from.y - scaleY * to.y
  const still =
    Math.abs(dx) < 0.5 &&
    Math.abs(dy) < 0.5 &&
    Math.abs(scaleX - 1) < 0.01 &&
    Math.abs(scaleY - 1) < 0.01
  if (still) return
  const frames = [
    { transform: `matrix(${scaleX}, 0, 0, ${scaleY}, ${dx}, ${dy})` },
    { transform: "none" },
  ]
  // Entering eases out; a bar already on screen eases in and out.
  const timing: KeyframeAnimationOptions = current
    ? { duration: MORPH_MS, easing: IN_OUT }
    : {
        duration: MORPH_MS - ENTER_DELAY_MS,
        delay: ENTER_DELAY_MS,
        easing: OUT,
        fill: "backwards",
      }
  const animation = node.animate(frames, timing)
  flips.set(node, { from, to, animation })
}

/** Fades the new margin lane and axis labels in under the outgoing copies. */
export function fadeInLayers(host: HTMLElement, morph: Morph | null) {
  if (!live(morph)) return
  for (const group of host.querySelectorAll(FADING)) {
    group.animate([{ opacity: 0 }, { opacity: 1 }], {
      duration: FADE_IN_MS,
      delay: FADE_IN_DELAY_MS,
      easing: OUT,
      fill: "backwards",
    })
  }
}