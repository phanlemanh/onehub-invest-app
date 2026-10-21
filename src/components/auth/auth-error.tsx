"use client"

import { CircleAlertIcon } from "lucide-react"

import { Alert, AlertDescription } from "@/components/reui/alert"

/** Lỗi từ server action (qua ?error=) — Alert destructive của ReUI. */
export function AuthError({ message }: { message?: string }) {
  if (!message) return null
  return (
    <Alert variant="destructive">
      <CircleAlertIcon aria-hidden="true" />
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  )
}
