import { readFile, readdir, stat } from "node:fs/promises";
import { homedir } from "node:os";
import path from "node:path";

import { pool } from "./db";
import {
  directoryCacheIsFresh,
  listZaloAccounts,
  readCachedDirectory,
  refreshZaloGroupDirectoryInBackground,
} from "./zalo-admin";

/**
 * Queries + trạng thái máy cho /ops/collections "Thu Thập" (E2 tiếp theo,
 * ADR-0007 DCA): cùng dữ liệu cho GUI và /api/v1/ops/collections.
 *
 * Ba câu hỏi trang phải trả lời:
 *  1. Hôm nay chảy vào gì? (DB counts theo ngày)
 *  2. Qua cổng nào? (funnel gate Kev parse hook log)
 *  3. Máy móc có chạy không? (launchd logs + probe port)
 */

// ---- C4 P2: trên cloud (Vercel), các hàn local-bound (đọc log/file/CLI)
// lấy dữ liệu từ ops_heartbeat do máy thu đẩy mỗi 15 phút ----

type LocalFacts = {
  pushedAt: string;
  funnel: GateFunnel;
  health: ZaloHealth;
  jobs: JobStatus[];
  rotation: { cursor: number; total: number; next: { id: string; name: string; lastCapturedAt: string | null }[]; updatedAt?: string | null };
  zaloGroups: ZaloGroupRow[];
  zaloFlow: Record<string, { posts?: number; offers?: number }>;
  zaloAccounts?: { accountId: string; name: string | null; profile: string; enabledGroups: string[] }[];
};

/** Cloud: danh sách tài khoản Zalo từ ops-heartbeat (read-only). */
export async function getZaloAccountsFromFacts(): Promise<LocalFacts["zaloAccounts"]> {
  const f = await getLocalFacts();
  return f?.zaloAccounts ?? [];
}

const isCloud = () => process.env.VERCEL === "1";

let factsCache: { at: number; facts: LocalFacts | null } | null = null;
async function getLocalFacts(): Promise<LocalFacts | null> {
  if (!isCloud()) return null;
  if (factsCache && Date.now() - factsCache.at < 30_000) return factsCache.facts;
  try {
    const { rows } = await pool.query<{ payload: LocalFacts }>(
      `SELECT payload FROM ops_heartbeat WHERE id = 'primary'`,
    );
    factsCache = { at: Date.now(), facts: rows[0]?.payload ?? null };
  } catch {
    factsCache = { at: Date.now(), facts: null };
  }
  return factsCache.facts;
}

export async function getFactsPushedAt(): Promise<string | null> {
  const f = await getLocalFacts();
  return f?.pushedAt ?? null;
}

export type FlowDay = {
  day: string; // YYYY-MM-DD
  airdnaMarkets: number;
  airdnaListings: number;
  airbnbListingsSeen: number;
  airbnbSnapshots: number;
  zaloPosts: number;
  zaloOffers: number;
};

/** Luồng N ngày gần nhất theo nguồn. Perf-audit: từng là 42 subquery
 * non-sargable (col::date = d, 250ms, tăng theo bảng) — nay mỗi nguồn MỘT
 * GROUP BY có lọc khoảng ngày, gộp bằng JS. */
export async function getFlowDays(n = 7): Promise<FlowDay[]> {
  const since = new Date(Date.now() - (n - 1) * 86400000);
  const sinceDate = since.toISOString().slice(0, 10);
  const [mk, al, li, sn, zp, of] = await Promise.all([
    pool.query(`SELECT captured_at::date::text d, count(*)::int n FROM airdna_markets WHERE captured_at >= $1 GROUP BY 1`, [since]),
    pool.query(`SELECT captured_at::date::text d, count(*)::int n FROM airdna_listings WHERE captured_at >= $1 GROUP BY 1`, [since]),
    pool.query(`SELECT last_seen::date::text d, count(*)::int n FROM listings WHERE last_seen >= $1 GROUP BY 1`, [since]),
    pool.query(`SELECT collected_at::date::text d, count(*)::int n FROM airbnb_snapshots WHERE collected_at >= $1 GROUP BY 1`, [since]),
    pool.query(`SELECT captured_at::date::text d, count(*)::int n FROM stg_zalo_posts WHERE captured_at >= $1 GROUP BY 1`, [since]),
    pool.query(`SELECT first_seen::date::text d, count(*)::int n FROM sale_offers WHERE first_seen >= $1 GROUP BY 1`, [since]),
  ]);
  const pick = (rows: { d: string; n: number }[]) => new Map(rows.map((r) => [r.d, r.n]));
  const [M, A, L, S, Z, O] = [pick(mk.rows), pick(al.rows), pick(li.rows), pick(sn.rows), pick(zp.rows), pick(of.rows)];
  const facts = await getLocalFacts();
  const days: FlowDay[] = [];
  for (let i = 0; i < n; i++) {
    const d = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10);
    const z = facts?.zaloFlow?.[d]; // cloud: stg không sync — số zalo từ facts
    days.push({
      day: d,
      airdnaMarkets: M.get(d) ?? 0,
      airdnaListings: A.get(d) ?? 0,
      airbnbListingsSeen: L.get(d) ?? 0,
      airbnbSnapshots: S.get(d) ?? 0,
      zaloPosts: z?.posts ?? Z.get(d) ?? 0,
      zaloOffers: z?.offers ?? O.get(d) ?? 0,
    });
  }
  return days; // mốc sinceDate trở đi; đủ n ngày gần nhất
}

export type GateFunnel = {
  lastEventAt: string | null;
  today: { messages: number; passed: number; skipped: number; accepted: number; media: number };
  last7: { messages: number; passed: number; skipped: number; accepted: number; media: number };
};

const EMPTY = { messages: 0, passed: 0, skipped: 0, accepted: 0, media: 0 };

/** Funnel cổng Kev từ hook log (~/.openclaw/logs/oneinvest-zalo-pipe.log). */
export async function readGateFunnel(): Promise<GateFunnel> {
  {
    const f = await getLocalFacts();
    if (f) return f.funnel;
  }
  const file = path.join(homedir(), ".openclaw/logs/oneinvest-zalo-pipe.log");
  let text = "";
  try {
    text = await readFile(file, "utf8");
  } catch {
    return { lastEventAt: null, today: { ...EMPTY }, last7: { ...EMPTY } };
  }
  const lines = text.split("\n").filter(Boolean);
  const todayKey = new Date().toISOString().slice(0, 10);
  const cutoff = Date.now() - 7 * 86400000;
  const today = { ...EMPTY };
  const last7 = { ...EMPTY };
  let lastEventAt: string | null = null;
  for (const line of lines) {
    if (/ (heartbeat|alert) /.test(line)) continue; // gióng máy, không phải tin
    const ts = line.slice(0, 24);
    const iso = /^\d{4}-\d{2}-\d{2}T/.test(ts) ? ts : null;
    const in7 = iso ? new Date(iso).getTime() >= cutoff : true; // dòng không timestamp: đếm vào 7 ngày
    const day = iso ? iso.slice(0, 10) : null;
    for (const bucket of [in7 ? last7 : null, day === todayKey ? today : null]) {
      if (!bucket) continue;
      bucket.messages++;
      if (line.includes(" post 202")) {
        bucket.passed++;
        const m = line.match(/"accepted":(\d+)/);
        bucket.accepted += m ? Number(m[1]) : 0;
      } else if (/ skip /.test(line)) bucket.skipped++;
      if (/media/i.test(line)) bucket.media++;
    }
    if (iso) lastEventAt = iso;
  }
  return { lastEventAt, today, last7 };
}

export type JobStatus = {
  id: string;
  label: string;
  schedule: string;
  alive: "yes" | "no" | "unknown"; // probe HTTP localhost
  lastLogAt: string | null;
  lastLine: string | null;
};

const ROOT = process.cwd().endsWith("/app") ? path.resolve(process.cwd(), "..") : process.cwd();
const LOGS = path.join(ROOT, "pipeline/logs");

async function tailFile(file: string): Promise<{ mtime: string | null; lastLine: string | null }> {
  try {
    const st = await stat(file);
    const text = await readFile(file, "utf8");
    const lines = text.split("\n").filter((l) => l.trim());
    return { mtime: st.mtime.toISOString(), lastLine: lines.at(-1)?.slice(0, 140) ?? null };
  } catch {
    return { mtime: null, lastLine: null };
  }
}

async function latestWeeklyLog(): Promise<string | null> {
  try {
    const files = (await readdir(LOGS)).filter((f) => /^weekly-.*\.log$/.test(f)).sort();
    return files.length ? path.join(LOGS, files.at(-1)!) : null;
  } catch {
    return null;
  }
}

async function probe(url: string): Promise<"yes" | "no"> {
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 800);
    const res = await fetch(url, { signal: ctrl.signal });
    clearTimeout(t);
    return res.status > 0 ? "yes" : "no";
  } catch {
    return "no";
  }
}

/** Trạng thái 5 launchd agent + 2 dịch vụ KeepAlive. */
export async function readSchedulerStatus(): Promise<JobStatus[]> {
  {
    const f = await getLocalFacts();
    if (f) return f.jobs;
  }
  const weekly = await latestWeeklyLog();
  const [kevAlive, apiAlive, airdnaLog, smokeLog, apiLog, weeklyTail] = await Promise.all([
    probe("http://127.0.0.1:8009/"),
    probe("http://127.0.0.1:9210/"),
    tailFile(path.join(LOGS, "airdna-daily.log")),
    tailFile(path.join(LOGS, "launchd-smoke.log")),
    tailFile(path.join(LOGS, "launchd-collector-api.log")),
    weekly ? tailFile(weekly) : Promise.resolve({ mtime: null, lastLine: null }),
  ]);
  return [
    {
      id: "airdna-daily",
      label: "AirDNA toàn quốc (rotation 6 market)",
      schedule: "19:05 hằng ngày",
      alive: "unknown",
      lastLogAt: airdnaLog.mtime,
      lastLine: airdnaLog.lastLine,
    },
    {
      id: "collector",
      label: "Airbnb tự thu Hà Nội (discovery + listing + finalize)",
      schedule: "Chủ nhật 19:30 +jitter ≤30′",
      alive: "unknown",
      lastLogAt: weeklyTail.mtime,
      lastLine: weeklyTail.lastLine,
    },
    {
      id: "smoke",
      label: "Smoke Airbnb (detect đổi markup)",
      schedule: "20:00 hằng ngày",
      alive: "unknown",
      lastLogAt: smokeLog.mtime,
      lastLine: smokeLog.lastLine,
    },
    {
      id: "collector-api",
      label: "Agent ingest :9210",
      schedule: "KeepAlive — chạy liên tục",
      alive: apiAlive,
      lastLogAt: apiLog.mtime,
      lastLine: apiLog.lastLine,
    },
    {
      id: "kev",
      label: "Kev gate :8009",
      schedule: "KeepAlive — chạy liên tục",
      alive: kevAlive,
      lastLogAt: null,
      lastLine: null,
    },
  ];
}

export type RotationPreview = {
  updatedAt: string | null;
  cursor: number;
  total: number;
  next: { id: string; name: string; lastCapturedAt: string | null }[];
};

/** Xem trước rotation kế tiếp: lặp logic airdna-rotate.mjs (skip fresh <24h). */
export async function readRotationPreview(): Promise<RotationPreview> {
  {
    const f = await getLocalFacts();
    if (f) return { updatedAt: f.rotation.updatedAt ?? f.pushedAt, cursor: f.rotation.cursor, total: f.rotation.total, next: f.rotation.next };
  }
  let cursor = 0;
  let updatedAt: string | null = null;
  try {
    const st = JSON.parse(
      await readFile(path.join(ROOT, "collector/state/airdna-rotation.json"), "utf8"),
    );
    cursor = st.cursor ?? 0;
    updatedAt = st.updatedAt ?? null;
  } catch {
    /* chưa chạy đêm nào */
  }
  const { rows } = await pool.query(
    `SELECT airdna_id, name, captured_at FROM airdna_markets
      WHERE country_code = 'vn' ORDER BY airdna_id::int`,
  );
  const cutoff = Date.now() - 86400000;
  const next: RotationPreview["next"] = [];
  let i = cursor;
  for (let step = 0; step < rows.length && next.length < 6; step++) {
    const r = rows[i % rows.length];
    const fresh = r.captured_at !== null && new Date(r.captured_at).getTime() > cutoff;
    if (!fresh) {
      next.push({
        id: String(r.airdna_id),
        name: r.name ?? r.airdna_id,
        lastCapturedAt: r.captured_at ? new Date(r.captured_at).toISOString() : null,
      });
    }
    i++;
  }
  return { updatedAt, cursor, total: rows.length, next };
}

// ---------- Zalo: tầng Nhóm + tách thật/mock (V1 nhóm-metrics) ----------

export type ZaloGroupRow = {
  name: string;
  isMockOnly: boolean; // nhóm chỉ xuất hiện trong snapshot zalo-mock
  realPosts7d: number;
  mockPosts7d: number;
  lastSeenAt: string | null;
  // funnel từ hook log (chỉ nhóm thật)
  seen: number;
  passed: number;
  skipped: number;
  accepted: number;
  lastEventAt: string | null;
  ownerAccount: string | null; // account đang sở hữu nhóm (config/directory)
};

export type ZaloAllowlistEntry = { groupId: string; enabled: boolean };

/** Allowlist đọc runtime từ ~/.openclaw/openclaw.json — KHÔNG commit id vào
 * repo/migration (SPL ADR-0007: định danh nguồn thật ở tầng A, máy local). */
export async function readZaloAllowlist(): Promise<ZaloAllowlistEntry[]> {
  try {
    const cfg = JSON.parse(
      await readFile(path.join(homedir(), ".openclaw/openclaw.json"), "utf8"),
    );
    const groups = cfg?.channels?.zalouser?.groups ?? {};
    return Object.entries(groups).map(([groupId, v]) => ({
      groupId,
      enabled: Boolean((v as { enabled?: boolean })?.enabled),
    }));
  } catch {
    return [];
  }
}

/** Funnel cổng Kev theo nhóm từ hook log (dòng có tag group=). */
function gateByGroup(text: string): Map<string, ZaloGroupRow> {
  const m = new Map<string, ZaloGroupRow>();
  for (const line of text.split("\n")) {
    const g = line.match(/group=(.+?)(?:\s+p=|$)/)?.[1];
    if (!g) continue;
    const row =
      m.get(g) ??
      ({
        name: g,
        isMockOnly: false,
        realPosts7d: 0,
        mockPosts7d: 0,
        lastSeenAt: null,
        seen: 0,
        passed: 0,
        skipped: 0,
        accepted: 0,
        lastEventAt: null,
        ownerAccount: null,
      } satisfies ZaloGroupRow);
    // dòng log mới có tag account= (handler ≥2026-10-20 chiều) — attribution chính xác
    const acc = line.match(/\baccount=([a-z0-9-]+)/)?.[1];
    if (acc && acc !== "?") row.ownerAccount = acc;
    row.seen++;
    if (line.includes(" post 202")) {
      row.passed++;
      row.accepted += Number(line.match(/"accepted":(\d+)/)?.[1] ?? 0);
    } else if (/ skip /.test(line)) row.skipped++;
    const ts = line.slice(0, 24);
    if (/^\d{4}-\d{2}-\d{2}T/.test(ts)) row.lastEventAt = ts;
    m.set(g, row);
  }
  return m;
}

/** Bảng nhóm Zalo: nhóm thật (stg posts snapshot zalo-agent + hook log) và
 * nhóm mock tách riêng để không tô hồng số thật. */
export async function getZaloGroups(): Promise<ZaloGroupRow[]> {
  {
    const f = await getLocalFacts();
    if (f) return f.zaloGroups;
  }
  const [postRows, logText] = await Promise.all([
    pool.query(
      `SELECT group_name,
              count(*) FILTER (WHERE snapshot_id LIKE '%zalo-agent%'
                 AND captured_at >= now() - interval '7 days')::int AS real7,
              count(*) FILTER (WHERE snapshot_id NOT LIKE '%zalo-agent%'
                 AND captured_at >= now() - interval '7 days')::int AS mock7,
              max(captured_at) FILTER (WHERE snapshot_id LIKE '%zalo-agent%') AS last_real,
              bool_and(snapshot_id NOT LIKE '%zalo-agent%') AS mock_only
         FROM stg_zalo_posts
        WHERE group_name IS NOT NULL
        GROUP BY group_name`,
    ),
    readFile(path.join(homedir(), ".openclaw/logs/oneinvest-zalo-pipe.log"), "utf8").catch(
      () => "",
    ),
  ]);
  const byLog = gateByGroup(logText);
  const rows = new Map<string, ZaloGroupRow>();
  for (const r of postRows.rows) {
    rows.set(r.group_name, {
      name: r.group_name,
      isMockOnly: r.mock_only,
      realPosts7d: r.real7,
      mockPosts7d: r.mock7,
      lastSeenAt: r.last_real ? new Date(r.last_real).toISOString() : null,
      seen: 0,
      passed: 0,
      skipped: 0,
      accepted: 0,
      lastEventAt: null,
      ownerAccount: null,
    });
  }
  // Attribution từ config: tên nhóm → account. Perf-audit: KHÔNG bao giờ chờ
  // CLI ~8s trong render — chỉ dùng cache tươi; cache lạnh thì kick refresh
  // ngầm song song (song song mọi account) → render sau có owner.
  try {
    const accounts = await listZaloAccounts();
    const dirs = new Map<string, string>(); // groupName → accountId
    const staleAccounts: string[] = [];
    for (const a of accounts) {
      if (directoryCacheIsFresh(a.accountId)) {
        for (const g of readCachedDirectory(a.accountId)) dirs.set(g.name, a.accountId);
      } else {
        staleAccounts.push(a.accountId);
      }
    }
    for (const id of staleAccounts) refreshZaloGroupDirectoryInBackground(id);
    for (const row of rows.values()) {
      if (!row.ownerAccount) row.ownerAccount = dirs.get(row.name) ?? null;
    }
  } catch {
    /* directory chưa sẵn sàng — để owner null, lần load sau có */
  }
  for (const [name, funnel] of byLog) {
    const row = rows.get(name) ?? {
      name,
      isMockOnly: false,
      realPosts7d: 0,
      mockPosts7d: 0,
      lastSeenAt: null,
      seen: 0,
      passed: 0,
      skipped: 0,
      accepted: 0,
      lastEventAt: null,
      ownerAccount: null,
    };
    Object.assign(row, {
      seen: funnel.seen,
      passed: funnel.passed,
      skipped: funnel.skipped,
      accepted: funnel.accepted,
      lastEventAt: funnel.lastEventAt,
      lastSeenAt: row.lastSeenAt ?? funnel.lastEventAt,
    });
    rows.set(name, row);
  }
  return [...rows.values()].sort((a, b) => {
    if (a.isMockOnly !== b.isMockOnly) return a.isMockOnly ? 1 : -1; // thật trước
    return (b.lastSeenAt ?? "").localeCompare(a.lastSeenAt ?? "");
  });
}

export type ZaloHealth = {
  connected: boolean | null; // null = chưa có heartbeat nào
  uptime24h: number | null; // 0-1, chia theo dòng heartbeat 24h qua
  heartbeatAgeMin: number | null; // dòng heartbeat cuối cách bao lâu (probe chết?)
  lastHeartbeatAt: string | null;
  lastPostAt: string | null; // dòng " post 202" cuối
  silentAlert24h: boolean;
  driftAlert24h: boolean; // allowlist lệch membership / vi phạm 1-1
};

/** Tầng Ống V2: sức khoẻ ống Zalo từ dòng heartbeat trong log hook. */
export async function readZaloHealth(): Promise<ZaloHealth> {
  {
    const f = await getLocalFacts();
    if (f) return f.health;
  }
  let text = "";
  try {
    text = await readFile(path.join(homedir(), ".openclaw/logs/oneinvest-zalo-pipe.log"), "utf8");
  } catch {
    return {
      connected: null, uptime24h: null, heartbeatAgeMin: null,
      lastHeartbeatAt: null, lastPostAt: null, silentAlert24h: false,
      driftAlert24h: false,
    };
  }
  const now = Date.now();
  let up = 0, total = 0, lastHb: string | null = null, lastPost: string | null = null,
      silentAlert = false, driftAlert = false;
  for (const line of text.split("\n")) {
    const ts = line.slice(0, 24);
    if (!/^\d{4}-\d{2}-\d{2}T/.test(ts)) continue;
    const t = new Date(ts).getTime();
    if (line.includes(" heartbeat ")) {
      lastHb = ts;
      if (now - t <= 86400000) {
        total++;
        if (line.includes(" up ")) up++;
      }
    } else if (line.includes(" post 202")) {
      lastPost = ts;
    } else if (line.includes(" alert silent-gate") && now - t <= 86400000) {
      silentAlert = true;
    } else if (line.includes(" alert drift") && now - t <= 86400000) {
      driftAlert = true;
    }
  }
  const age = lastHb ? Math.round((now - new Date(lastHb).getTime()) / 60000) : null;
  return {
    connected: lastHb ? lastLinesUp(text) : null,
    uptime24h: total > 0 ? up / total : null,
    heartbeatAgeMin: age,
    lastHeartbeatAt: lastHb,
    lastPostAt: lastPost,
    silentAlert24h: silentAlert,
    driftAlert24h: driftAlert,
  };
}

// connected = trạng thái của dòng heartbeat CUỐI (không phải any-line)
function lastLinesUp(text: string): boolean {
  const hb = text.split("\n").filter((l) => l.includes(" heartbeat "));
  const last = hb.at(-1) ?? "";
  return last.includes(" up ");
}
