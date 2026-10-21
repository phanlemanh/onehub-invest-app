import type { User } from "./auth";

/**
 * Quyền vào Ops Portal (portals.md luật 3): bắt buộc đăng nhập. Khi đặt
 * OPS_EMAILS (danh sách email cách nhau dấu phẩy) thì chỉ các email đó vào
 * được — tạm thay cho role `ops` cho tới khi có bảng role thật.
 */
export function canAccessOps(user: User | null): boolean {
  if (!user) return false;
  const allow = (process.env.OPS_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return allow.length === 0 || allow.includes(user.email.toLowerCase());
}

/** Clearance law (ADR-0007 + portals.md): admin-class trang /ops gated role=admin. */
export function isAdmin(user: User | null): boolean {
  return user?.role === "admin";
}
