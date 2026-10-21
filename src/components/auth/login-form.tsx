"use client"

import Link from "next/link"

import { login } from "@/app/actions"
import { BrandMark } from "@/components/shell/brand-mark"
import {
  Frame,
  FrameDescription,
  FramePanel,
  FrameTitle,
} from "@/components/reui/frame"
import { Button } from "@/components/ui/button"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { AuthError } from "./auth-error"
import { PasswordField } from "./password-field"

const FOOTER_LINKS = [
  { label: "Trang chủ", href: "/" },
  { label: "Thị trường", href: "/vn" },
  { label: "Phương pháp", href: "/phuong-phap" },
]

/**
 * Đăng nhập — chuyển thể từ @reui/auth-4. Khác bản gốc: bỏ đăng nhập mạng xã
 * hội và "Quên mật khẩu" (hệ thống chưa có), nối server action `login`.
 */
export function LoginForm({ next, error }: { next: string; error?: string }) {
  return (
    <div className="relative flex min-h-svh w-full min-w-full flex-col">
      <div className="flex w-full min-w-full flex-1 items-center justify-center px-4 py-8 sm:px-6 sm:py-10 lg:px-10">
        <div className="mx-auto flex w-full max-w-[28rem] flex-col gap-4">
          <Frame spacing="lg" className="w-full">
            <FramePanel className="space-y-8 px-9 py-10 sm:space-y-9 sm:px-11 sm:py-11">
              <div className="flex flex-col items-center gap-5 pt-3 text-center">
                <BrandMark href="/" />
                <div className="flex max-w-xs flex-col gap-1.5">
                  <FrameTitle className="text-2xl tracking-tight sm:text-[1.75rem]">
                    Đăng nhập
                  </FrameTitle>
                  <FrameDescription className="text-sm text-pretty">
                    Lưu thị trường, phường và quay lại bất cứ lúc nào.
                  </FrameDescription>
                </div>
              </div>

              <AuthError message={error} />

              <form className="flex flex-col gap-5" action={login}>
                <input type="hidden" name="next" value={next} />
                <FieldGroup className="gap-4">
                  <Field className="gap-2">
                    <FieldLabel htmlFor="login-email">Email</FieldLabel>
                    <Input
                      id="login-email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      placeholder="ban@vidu.com"
                      required
                    />
                  </Field>
                  <Field className="gap-2">
                    <FieldLabel htmlFor="login-password">Mật khẩu</FieldLabel>
                    <PasswordField
                      id="login-password"
                      autoComplete="current-password"
                      placeholder="Nhập mật khẩu"
                    />
                  </Field>
                </FieldGroup>
                <Button type="submit" className="w-full">
                  Đăng nhập
                </Button>
              </form>
            </FramePanel>
          </Frame>

          <p className="text-muted-foreground text-center text-sm">
            Chưa có tài khoản?{" "}
            <Link
              href={`/register?next=${encodeURIComponent(next)}`}
              className="text-primary underline-offset-4 hover:underline"
            >
              Đăng ký
            </Link>
          </p>
        </div>
      </div>

      <footer className="relative z-10 bg-transparent">
        <div className="mx-auto flex max-w-4xl flex-col items-center justify-center gap-4 px-6 py-4 text-center sm:flex-row sm:flex-wrap sm:gap-x-9 sm:gap-y-2">
          <nav aria-label="Liên kết" className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
            {FOOTER_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-muted-foreground hover:text-primary text-sm underline-offset-4 transition-colors hover:underline"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </footer>
    </div>
  )
}
