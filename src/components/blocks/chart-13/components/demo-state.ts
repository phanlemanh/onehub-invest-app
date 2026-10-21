import { useSyncExternalStore } from "react"

// Demo state switch: ?demo-state=<name> opens a designed state; inert in a host app.
const subscribe = () => () => {}

export function useDemoState<T extends string>(states: readonly T[]): T | null {
  return useSyncExternalStore(
    subscribe,
    () => {
      const value = new URLSearchParams(window.location.search).get(
        "demo-state"
      )
      return states.find((state) => state === value) ?? null
    },
    () => null
  )
}