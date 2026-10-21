"use client"

import * as React from "react"
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
import { AuthLogo } from "./auth-logo"
import { AUTH4_FOOTER_LINKS, AUTH4_PROVIDERS } from "./data"
import { EyeOffIcon, EyeIcon } from "lucide-react"

type FormSubmitHandler = NonNullable<React.ComponentProps<"form">["onSubmit"]>
type FormSubmitEvent = Parameters<FormSubmitHandler>[0]

function FooterMenu() {
  return (
    <footer className="relative z-10 bg-transparent">
      <div className="mx-auto flex max-w-4xl flex-col items-center justify-center gap-4 px-6 py-4 text-center sm:flex-row sm:flex-wrap sm:gap-x-9 sm:gap-y-2">
        <nav
          aria-label="Footer"
          className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2"
        >
          {AUTH4_FOOTER_LINKS.map((link) => (
            <a
              key={link.id}
              href={link.href}
              className="text-muted-foreground hover:text-primary cursor-pointer text-sm underline-offset-4 transition-colors hover:underline"
            >
              {link.label}
            </a>
          ))}
        </nav>
      </div>
    </footer>
  )
}

export function Auth() {
  const [showPassword, setShowPassword] = React.useState(false)

  function handleSubmit(event: FormSubmitEvent) {
    event.preventDefault()
  }

  return (
    <div className="relative flex min-h-svh w-full min-w-full flex-col">
      <div className="flex w-full min-w-full flex-1 items-center justify-center px-4 py-8 sm:px-6 sm:py-10 lg:px-10">
        <div className="mx-auto flex w-full max-w-[28rem] flex-col gap-4">
          <Frame spacing="lg" className="w-full">
            <FramePanel className="space-y-8 px-9 py-10 sm:space-y-9 sm:px-11 sm:py-11">
              <div className="flex flex-col items-center gap-5 pt-3 text-center">
                <AuthLogo className="size-9" />

                <div className="flex max-w-xs flex-col gap-1.5">
                  <FrameTitle className="text-2xl tracking-tight sm:text-[1.75rem]">
                    Sign in
                  </FrameTitle>
                  <FrameDescription className="text-sm text-pretty">
                    Continue to your workspace.
                  </FrameDescription>
                </div>
              </div>

              <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
                <FieldGroup className="gap-4">
                  <Field className="gap-2">
                    <FieldLabel htmlFor="auth-4-email">
                      Email or username
                    </FieldLabel>
                    <Input
                      id="auth-4-email"
                      type="text"
                      autoComplete="username"
                      placeholder="Email or username"
                    />
                  </Field>

                  <Field className="gap-2">
                    <div className="flex items-center justify-between gap-3">
                      <FieldLabel htmlFor="auth-4-password">
                        Password
                      </FieldLabel>
                      <Button
                        type="button"
                        variant="link"
                        className="text-muted-foreground hover:text-foreground h-auto p-0 text-xs font-normal"
                      >
                        Forgot password?
                      </Button>
                    </div>

                    <InputGroup className="w-full">
                      <InputGroupInput
                        id="auth-4-password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="current-password"
                        placeholder="Enter your password"
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
                          onClick={() => setShowPassword((value) => !value)}
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

                <Button type="submit" className="w-full">
                  Sign in
                </Button>
              </form>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Separator className="flex-1" />
                  <span className="text-muted-foreground text-xs">
                    Or continue with
                  </span>
                  <Separator className="flex-1" />
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  {AUTH4_PROVIDERS.map((provider) => (
                    <Button
                      key={provider.id}
                      type="button"
                      variant="outline"
                      className="w-full justify-center"
                    >
                      {provider.logo}
                      {provider.label}
                    </Button>
                  ))}
                </div>
              </div>
            </FramePanel>
          </Frame>

          <p className="text-muted-foreground text-center text-sm">
            Need an account?{" "}
            <Button
              type="button"
              variant="link"
              className="text-primary hover:text-primary h-auto cursor-pointer p-0 underline-offset-4 hover:underline"
            >
              Sign up
            </Button>
          </p>
        </div>
      </div>

      {/* Footer */}
      <FooterMenu />
    </div>
  )
}