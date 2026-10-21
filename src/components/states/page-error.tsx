"use client"

import { CircleAlertIcon, RotateCwIcon } from "lucide-react"

import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
} from "@/components/reui/alert"
import { Button } from "@/components/ui/button"

/** Trạng thái lỗi chuẩn (c-alert-1, biến thể destructive + Thử lại). */
export function PageError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <Alert variant="destructive">
      <CircleAlertIcon aria-hidden="true" />
      <AlertTitle>Không tải được dữ liệu</AlertTitle>
      <AlertDescription>
        <p>
          Đã có lỗi khi lấy số liệu cho trang này. Thử lại sau giây lát; nếu vẫn
          lỗi, báo cho đội vận hành kèm mã bên dưới.
        </p>
        {error.digest && <p className="font-mono text-xs">Mã lỗi: {error.digest}</p>}
      </AlertDescription>
      <AlertAction>
        <Button variant="outline" size="sm" onClick={reset}>
          <RotateCwIcon data-icon="inline-start" aria-hidden="true" />
          Thử lại
        </Button>
      </AlertAction>
    </Alert>
  )
}
