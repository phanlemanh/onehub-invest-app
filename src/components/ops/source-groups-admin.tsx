"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { Badge } from "@/components/reui/badge";

/**
 * Quản trị nhóm nguồn (H1) — S05 Facebook groups + S06 Chợ Tốt regions.
 * Bảng nhóm + toggle bật/tắt + thêm nhóm + xoá (kèm purge dữ liệu chọn lọc).
 * Mọi thao tác qua /api/v1/ops/source-groups (audit ops:write). Client vì
 * cần optimistic toggle + confirm destructive.
 */
export type GroupRow = {
  id: number;
  source_code: string;
  group_key: string;
  name: string;
  enabled: boolean;
  note: string | null;
  fb_posts: number;
};

function Toggle({ on, disabled }: { on: boolean; disabled?: boolean }) {
  return (
    <span
      className={`inline-flex h-5 w-9 items-center rounded-full transition-colors ${
        on ? "bg-emerald-500" : "bg-muted-foreground/30"
      } ${disabled ? "opacity-50" : ""}`}
    >
      <span
        className={`ml-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${
          on ? "translate-x-4" : ""
        }`}
      />
    </span>
  );
}

export function SourceGroupsAdmin({ initial }: { initial: GroupRow[] }) {
  const router = useRouter();
  const [groups, setGroups] = useState(initial);
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ sourceCode: "S05", groupKey: "", name: "" });

  const call = (body: Record<string, unknown>) =>
    fetch("/api/v1/ops/source-groups", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    }).then(async (r) => ({ ok: r.ok, data: await r.json().catch(() => ({})) }));

  const toggle = (g: GroupRow) => {
    setGroups((gs) => gs.map((x) => (x.id === g.id ? { ...x, enabled: !x.enabled } : x)));
    call({ action: "toggle", sourceCode: g.source_code, groupKey: g.group_key, enabled: !g.enabled })
      .then(({ ok, data }) => {
        if (!ok) {
          setGroups((gs) => gs.map((x) => (x.id === g.id ? { ...x, enabled: g.enabled } : x)));
          setMsg(`❌ ${data.error ?? "lỗi"}`);
        }
      })
      .catch(() => setMsg("❌ mạng"));
  };

  const remove = (g: GroupRow) => {
    const purge = g.fb_posts > 0
      ? confirm(`Xoá nhóm "${g.name}"?\n\nOK = xoá nhóm VÀ ${g.fb_posts} posts dữ liệu của nó (nhóm khác không bị đụng).\nCancel = hoãn.`)
      : confirm(`Xoá nhóm "${g.name}"?`);
    if (!purge) return;
    start(async () => {
      const { ok, data } = await call({
        action: "delete", sourceCode: g.source_code, groupKey: g.group_key, purge: g.fb_posts > 0,
      });
      setMsg(ok ? `✓ đã xoá${data.purged ? ` (+${data.purged} posts)` : ""}` : `❌ ${data.error}`);
      if (ok) setGroups((gs) => gs.filter((x) => x.id !== g.id));
    });
  };

  const add = () => {
    if (!form.groupKey.trim() || !form.name.trim()) return setMsg("❌ cần đủ URL/key + tên");
    start(async () => {
      const { ok, data } = await call({ action: "add", ...form });
      setMsg(ok ? "✓ đã thêm — hiệu lực chu kỳ thu kế tiếp" : `❌ ${data.error}`);
      if (ok) {
        setAdding(false);
        setForm({ sourceCode: "S05", groupKey: "", name: "" });
        router.refresh();
      }
    });
  };

  const bySource = groups.reduce<Record<string, GroupRow[]>>((acc, g) => {
    (acc[g.source_code] ??= []).push(g);
    return acc;
  }, {});

  return (
    <div className="flex flex-col gap-4">
      {msg && <p className="text-xs text-muted-foreground">{msg}</p>}
      {Object.entries(bySource).map(([code, list]) => (
        <div key={code} className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">
              {code === "S05" ? "Nhóm Facebook (Apify)" : code === "S06" ? "Tỉnh/TP Chợ Tốt" : code}
            </h3>
            <span className="text-muted-foreground text-xs">
              {list.filter((g) => g.enabled).length}/{list.length} bật
            </span>
          </div>
          <div className="overflow-hidden rounded-lg border">
            {list.map((g) => (
              <div
                key={g.id}
                className="flex items-center justify-between gap-3 border-b px-3 py-2 text-xs last:border-0"
              >
                <div className="flex min-w-0 flex-col">
                  <span className="truncate font-medium">{g.name}</span>
                  <span className="text-muted-foreground truncate">
                    {g.fb_posts > 0 ? `${g.fb_posts} posts · ` : ""}
                    {g.group_key.length > 60 ? g.group_key.slice(0, 57) + "…" : g.group_key}
                  </span>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Badge variant={g.enabled ? "success-light" : "outline"}>
                    {g.enabled ? "đang thu" : "tắt"}
                  </Badge>
                  <button onClick={() => toggle(g)} aria-label="bật/tắt nhóm" type="button">
                    <Toggle on={g.enabled} />
                  </button>
                  <button
                    onClick={() => remove(g)}
                    type="button"
                    className="text-muted-foreground hover:text-destructive"
                    aria-label="xoá nhóm"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
      {adding ? (
        <div className="flex flex-col gap-2 rounded-lg border p-3">
          <div className="flex gap-2">
            <select
              value={form.sourceCode}
              onChange={(e) => setForm({ ...form, sourceCode: e.target.value })}
              className="rounded-md border bg-background px-2 py-1 text-xs"
            >
              <option value="S05">S05 Facebook</option>
              <option value="S06">S06 Chợ Tốt</option>
            </select>
            <input
              value={form.groupKey}
              onChange={(e) => setForm({ ...form, groupKey: e.target.value })}
              placeholder={form.sourceCode === "S05" ? "https://www.facebook.com/groups/…" : "city slug vd danang"}
              className="flex-1 rounded-md border bg-background px-2 py-1 text-xs"
            />
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="tên hiển thị"
              className="w-40 rounded-md border bg-background px-2 py-1 text-xs"
            />
          </div>
          {form.sourceCode === "S06" && (
            <p className="text-muted-foreground text-[11px]">
              Chợ Tốt cần thêm params (region_v2, cityCode) — tạm thêm bằng SQL hoặc nói agent
              thêm; UI đầy đủ cho S06 ở vòng sau.
            </p>
          )}
          <div className="flex gap-2">
            <button onClick={add} disabled={pending} type="button"
              className="rounded-md bg-primary px-3 py-1 text-xs text-primary-foreground">
              Lưu
            </button>
            <button onClick={() => setAdding(false)} type="button"
              className="rounded-md border px-3 py-1 text-xs">Huỷ</button>
          </div>
        </div>
      ) : (
        <button onClick={() => setAdding(true)} type="button"
          className="self-start rounded-md border px-3 py-1 text-xs hover:bg-muted/50">
          + Thêm nhóm
        </button>
      )}
    </div>
  );
}
