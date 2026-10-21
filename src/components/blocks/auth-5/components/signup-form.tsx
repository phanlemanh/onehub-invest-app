"use client"

import { useState, type ComponentProps } from "react"
import {
  Frame,
  FrameDescription,
  FramePanel,
  FrameTitle,
} from "@/components/reui/frame"

import { Button } from "@/components/ui/button"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"
import { Separator } from "@/components/ui/separator"
import { AUTH5_PROVIDERS } from "./data"
import { EyeOffIcon, EyeIcon, ArrowRightIcon } from "lucide-react"

type FormSubmitHandler = NonNullable<ComponentProps<"form">["onSubmit"]>
type FormSubmitEvent = Parameters<FormSubmitHandler>[0]

export function SignupForm() {
  const [showPassword, setShowPassword] = useState(false)

  function handleSubmit(event: FormSubmitEvent) {
    event.preventDefault()
  }

  return (
    <Frame className="w-full">
      {/* Content */}
      <FramePanel className="space-y-7 p-6 sm:space-y-8">
        <div className="space-y-2">
          <FrameTitle className="text-xl tracking-tight">
            Start your 14-day trial
          </FrameTitle>
          <FrameDescription>
            No credit card. No sales call. Just ship.
          </FrameDescription>
        </div>

        <div className="flex flex-col gap-3">
          {AUTH5_PROVIDERS.map((provider) => (
            <Button
              key={provider.id}
              type="button"
              variant="outline"
              className="w-full justify-center"
            >
              {provider.logo}
              <span>{provider.label}</span>
            </Button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <Separator className="flex-1" />
          <span className="text-muted-foreground text-xs tracking-wide uppercase">
            or
          </span>
          <Separator className="flex-1" />
        </div>

        <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
          <FieldGroup className="gap-5">
            <Field className="gap-2">
              <FieldLabel htmlFor="auth-5-email">
                Work email
              </FieldLabel>
              <Input
                id="auth-5-email"
                type="email"
                autoComplete="email"
                placeholder="you@company.com"
                required
              />
            </Field>

            <Field className="gap-2">
              <FieldLabel htmlFor="auth-5-password">
                Password
              </FieldLabel>
              <InputGroup>
                <InputGroupInput
                  id="auth-5-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="8+ characters"
                  required
                />
                <InputGroupAddon align="inline-end">
                  <InputGroupButton
                    type="button"
                    size="icon-xs"
                    className="text-muted-foreground hover:text-foreground"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    aria-pressed={showPassword}
                    onClick={() => setShowPassword((current) => !current)}
                  >
                    {showPassword ? (
                      <EyeOffIcon aria-hidden="true" className="size-4" />
                    ) : (
                      <EyeIcon aria-hidden="true" className="size-4" />
                    )}
                  </InputGroupButton>
                </InputGroupAddon>
              </InputGroup>
            </Field>
          </FieldGroup>

          <Button type="submit" className="mt-1.5 w-full">
            Start free trial
            <ArrowRightIcon aria-hidden="true" data-icon="inline-end" />
          </Button>

          <p className="text-muted-foreground text-center text-xs leading-5 text-pretty">
            By continuing you agree to ReUI&apos;s{" "}
            <a
              href="#"
              className="text-foreground hover:text-primary underline underline-offset-4 transition-colors"
            >
              Terms
            </a>{" "}
            and{" "}
            <a
              href="#"
              className="text-foreground hover:text-primary underline underline-offset-4 transition-colors"
            >
              Privacy Policy
            </a>
            .
          </p>
        </form>
      </FramePanel>
    </Frame>
  )
}