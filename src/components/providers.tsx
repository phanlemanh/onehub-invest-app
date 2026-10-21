"use client"

import type { ReactNode } from "react"
import { ThemeProvider } from "next-themes"

import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"

/**
 * Shell ReUI gọi useTheme → bắt buộc ThemeProvider; tooltip cần TooltipProvider;
 * block chart báo "đã tải CSV" qua sonner → Toaster.
 * Mặc định theo hệ thống: mọi trang đã dùng token của ReUI (P5), không còn
 * trang viết tay hardcode màu sáng.
 */
export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <TooltipProvider>
        {children}
        <Toaster />
      </TooltipProvider>
    </ThemeProvider>
  )
}
