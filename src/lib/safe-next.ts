/**
 * Chỉ cho chuyển hướng trong site: "/abc" hợp lệ; "//evil.com", "https://…"
 * hay rỗng → "/". Dùng ở cả server action lẫn trang (GET ?next=…).
 */
export function safeNext(next: string | null | undefined): string {
  return next && next.startsWith("/") && !next.startsWith("//") && !next.startsWith("/\\")
    ? next
    : "/";
}
