import { pool } from "./db";

/**
 * Audit mọi thao tác GHI ops (ADR-0007 DCA, C4 P3). Fire-and-forget — lỗi
 * audit không được làm hỏng thao tác chính (ghi best-effort, log stderr).
 * Actor luôn là MÃ (machine token / user id / action name) — không bao giờ
 * tên nguồn tầng A. env: local (máy thu) | cloud (Vercel).
 */
export function auditOpsWrite(
  actor: string,
  action: string,
  detail: Record<string, unknown> = {},
): void {
  const env = process.env.VERCEL === "1" ? "cloud" : "local";
  pool
    .query(
      `INSERT INTO ops_audit (actor, action, env, detail) VALUES ($1, $2, $3, $4::jsonb)`,
      [actor, action, env, JSON.stringify(detail)],
    )
    .catch((e) => console.error("audit write failed:", e instanceof Error ? e.message : e));
}
