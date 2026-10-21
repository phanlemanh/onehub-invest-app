"use client"

import { useState } from "react"
import { EyeIcon, EyeOffIcon } from "lucide-react"

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"

/** Ô mật khẩu có nút hiện/ẩn — tách nguyên từ auth-4/auth-5. */
export function PasswordField({
  id,
  autoComplete,
  placeholder,
}: {
  id: string
  autoComplete: "current-password" | "new-password"
  placeholder: string
}) {
  const [show, setShow] = useState(false)
  return (
    <InputGroup className="w-full">
      <InputGroupInput
        id={id}
        name="password"
        type={show ? "text" : "password"}
        autoComplete={autoComplete}
        placeholder={placeholder}
        required
        minLength={autoComplete === "new-password" ? 8 : undefined}
      />
      <InputGroupAddon align="inline-end">
        <InputGroupButton
          type="button"
          size="icon-xs"
          className="text-muted-foreground hover:text-foreground"
          aria-label={show ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
          aria-pressed={show}
          onClick={() => setShow((v) => !v)}
        >
          {show ? (
            <EyeOffIcon aria-hidden="true" className="size-4" />
          ) : (
            <EyeIcon aria-hidden="true" className="size-4" />
          )}
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  )
}
