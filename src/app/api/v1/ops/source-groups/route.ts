import { NextResponse } from "next/server";

import { pool } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { canAccessOps } from "@/lib/ops-access";
import { auditOpsWrite } from "@/lib/audit";

export const dynamic = "force-dynamic";

/**
 * GET  /api/v1/ops/source-groups — danh sách nhóm cấu hình (S05 FB, S06 Chợ
 * Tốt) kèm volume dữ liệu đã thu theo nhóm.
 * POST { action: "toggle" | "add" | "delete", ... } — quản trị nhóm nguồn.
 *   toggle: { sourceCode, groupKey, enabled }
 *   add:    { sourceCode, groupKey, name, regionV2?, cityCode? } (Chợ Tốt)
 *   delete: { sourceCode, groupKey, purge: boolean } — purge=xoá cả posts
 *           stg_zalo_posts theo group_name (vô hiệu hóa với dữ liệu S06).
 * Mọi action ghi ops_audit (actor, action, detail).
 */
async function auth(req: Request): Promise<boolean> {
  const expected = process.env.OPS_API_TOKEN;
  const bearer = req.headers.get("authorization") ?? "";
  if (!!expected && bearer === `Bearer ${expected}`) return true;
  return canAccessOps(await getSessionUser());
}

export async function GET() {
  if (!(await auth(new Request("http://x")))) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const { rows } = await pool.query(
    `SELECT g.id, g.source_code, g.group_key, g.name, g.enabled, g.params, g.note,
            g.created_at::text, g.updated_at::text,
            (SELECT count(*)::int FROM stg_zalo_posts z
              WHERE z.agent_id = 'apify-facebook' AND z.group_name = g.name) AS fb_posts
     FROM source_groups g ORDER BY g.source_code, g.id`,
  );
  return NextResponse.json({ groups: rows });
}

export async function POST(req: Request) {
  if (!(await auth(req))) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const b = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!b?.action) return NextResponse.json({ error: "thiếu action" }, { status: 400 });
  const sourceCode = String(b.sourceCode ?? "");
  const groupKey = String(b.groupKey ?? "");

  if (b.action === "toggle") {
    if (!sourceCode || !groupKey) {
      return NextResponse.json({ error: "thiếu sourceCode/groupKey" }, { status: 400 });
    }
    const { rowCount } = await pool.query(
      `UPDATE source_groups SET enabled = $1, updated_at = now()
       WHERE source_code = $2 AND group_key = $3`,
      [Boolean(b.enabled), sourceCode, groupKey],
    );
    await auditOpsWrite("ops-user", "source-group:toggle", { sourceCode, groupKey, enabled: b.enabled });
    return NextResponse.json({ ok: rowCount === 1 });
  }

  if (b.action === "add") {
    const name = String(b.name ?? "").trim();
    if (!sourceCode || !groupKey || !name) {
      return NextResponse.json({ error: "thiếu sourceCode/groupKey/name" }, { status: 400 });
    }
    if (!groupKey.startsWith("http") && sourceCode === "S05") {
      return NextResponse.json({ error: "nhóm S05 cần URL https://www.facebook.com/groups/…" }, { status: 400 });
    }
    const params: Record<string, unknown> = {};
    if (b.regionV2) params.region_v2 = Number(b.regionV2);
    if (b.cityCode) params.cityCode = String(b.cityCode);
    try {
      await pool.query(
        `INSERT INTO source_groups (source_code, group_key, name, enabled, params)
         VALUES ($1, $2, $3, true, $4::jsonb)`,
        [sourceCode, groupKey, name, JSON.stringify(params)],
      );
    } catch (e) {
      const msg = e instanceof Error ? e.message : "";
      if (msg.includes("unique")) {
        return NextResponse.json({ error: "nhóm đã tồn tại" }, { status: 409 });
      }
      throw e;
    }
    await auditOpsWrite("ops-user", "source-group:add", { sourceCode, groupKey, name });
    return NextResponse.json({ ok: true });
  }

  if (b.action === "delete") {
    if (!sourceCode || !groupKey) {
      return NextResponse.json({ error: "thiếu sourceCode/groupKey" }, { status: 400 });
    }
    const { rows } = await pool.query(
      `SELECT name FROM source_groups WHERE source_code = $1 AND group_key = $2`,
      [sourceCode, groupKey],
    );
    const name = rows[0]?.name;
    let purged = 0;
    if (b.purge && name && sourceCode === "S05") {
      // xoá chọn lọc dữ liệu nhóm bị bỏ (nỗi "xoá cũng mệt" — giờ 1 click)
      const r = await pool.query(
        `DELETE FROM stg_zalo_posts WHERE agent_id = 'apify-facebook' AND group_name = $1`,
        [name],
      );
      purged = r.rowCount ?? 0;
    }
    await pool.query(`DELETE FROM source_groups WHERE source_code = $1 AND group_key = $2`, [
      sourceCode,
      groupKey,
    ]);
    await auditOpsWrite("ops-user", "source-group:delete", { sourceCode, groupKey, purge: purged });
    return NextResponse.json({ ok: true, purged });
  }

  return NextResponse.json({ error: `action lạ: ${String(b.action)}` }, { status: 400 });
}
