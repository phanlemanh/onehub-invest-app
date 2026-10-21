"use client"

import Link from "next/link"
import { ArrowRightIcon } from "lucide-react"

import { register } from "@/app/actions"
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
import { GradientWave } from "./gradient-wave"
import { PasswordField } from "./password-field"

/**
 * Đăng ký — chuyển thể từ @reui/auth-5 (trang chia đôi: lời giới thiệu | form).
 * Khác bản gốc: bỏ đăng ký mạng xã hội và dải logo khách hàng (không có thật),
 * lời giới thiệu viết cho nhà đầu tư; số liệu trong hero là số thật từ DB.
 */
export function RegisterForm({
  next,
  error,
  facts,
}: {
  next: string
  error?: string
  /** Vd ["2 thị trường Việt Nam", "460 listing tự thu"]. */
  facts: string[]
}) {
  return (
    <div className="bg-background relative isolate min-h-svh w-full overflow-hidden">
      <GradientWave />

      <div className="relative flex min-h-svh flex-col px-6 py-7 sm:px-12 sm:py-10 lg:px-14 lg:py-12">
        <header className="flex items-center justify-between">
          <BrandMark href="/" />
          <p className="text-foreground/75 text-sm font-medium">
            Đã có tài khoản?{" "}
            <Link
              href={`/login?next=${encodeURIComponent(next)}`}
              className="text-foreground hover:text-primary font-semibold underline-offset-4 transition-colors hover:underline"
            >
              Đăng nhập
            </Link>
          </p>
        </header>

        <main className="mx-auto flex w-full max-w-6xl flex-1 items-center py-16 sm:py-20 lg:py-24">
          <div className="grid w-full grid-cols-1 items-center gap-14 sm:gap-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)] lg:gap-24">
            <div className="flex max-w-xl flex-col gap-7 sm:gap-8">
              <div className="border-border/60 bg-background/80 text-foreground/70 inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1 text-sm font-medium tracking-tight backdrop-blur-sm">
                <span className="bg-primary size-1.5 rounded-full" aria-hidden="true" />
                <span>{facts.join(" · ")}</span>
              </div>
              <h1 className="text-foreground text-4xl leading-[1.02] font-semibold tracking-[-0.02em] text-balance sm:text-5xl lg:text-[56px]">
                Đầu tư cho thuê ngắn hạn bằng{" "}
                <span className="bg-gradient-to-r from-orange-500 via-pink-500 to-violet-500 bg-clip-text text-transparent">
                  số liệu
                </span>
                , không bằng cảm tính.
              </h1>
              <p className="text-muted-foreground max-w-xl text-base leading-relaxed text-pretty sm:text-lg">
                Công suất, giá phòng và lợi suất theo từng phường, từ lịch Airbnb
                tự thu thập. Tài khoản miễn phí để lưu khu vực và quay lại sau.
              </p>
            </div>

            <Frame className="w-full">
              <FramePanel className="space-y-7 p-6 sm:space-y-8">
                <div className="space-y-2">
                  <FrameTitle className="text-xl tracking-tight">Tạo tài khoản miễn phí</FrameTitle>
                  <FrameDescription>Chỉ cần email và mật khẩu.</FrameDescription>
                </div>

                <AuthError message={error} />

                <form className="flex flex-col gap-6" action={register}>
                  <input type="hidden" name="next" value={next} />
                  <FieldGroup className="gap-5">
                    <Field className="gap-2">
                      <FieldLabel htmlFor="register-email">Email</FieldLabel>
                      <Input
                        id="register-email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        placeholder="ban@vidu.com"
                        required
                      />
                    </Field>
                    <Field className="gap-2">
                      <FieldLabel htmlFor="register-password">Mật khẩu</FieldLabel>
                      <PasswordField
                        id="register-password"
                        autoComplete="new-password"
                        placeholder="Từ 8 ký tự"
                      />
                    </Field>
                  </FieldGroup>
                  <Button type="submit" className="mt-1.5 w-full">
                    Tạo tài khoản
                    <ArrowRightIcon aria-hidden="true" data-icon="inline-end" />
                  </Button>
                </form>
              </FramePanel>
            </Frame>
          </div>
        </main>
      </div>
    </div>
  )
}
