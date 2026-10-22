import { execFile } from "node:child_process";
import { copyFile, readFile, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import path from "node:path";
import { promisify } from "node:util";

/**
 * Quản trị tài khoản zalouser cho /ops (multi-account V1).
 *
 * Bất biến hệ thống (user chốt 2026-10-20): **1 nhóm – 1 tài khoản** — không
 * hai tài khoản cùng bật 1 nhóm (tránh trùng dữ liệu + giảm rủi ro platform).
 *
 * Semantics config (đọc từ source OpenClaw account-helpers): merge account ≡
 * shallow spread channel-level → account KHÔNG có `groups` riêng sẽ kế thừa
 * groups của channel. Vì vậy mọi tài khoản mới luôn ghi `groups` tường minh.
 */

const OPENCLAW = path.join(homedir(), ".openclaw/bin/openclaw");

/** Cloud (Vercel): không có ~/.openclaw — mọi hàm zalo-admin trả lỗi thân thiện. */
export function isZaloAdminAvailable(): boolean {
  return process.env.VERCEL !== "1";
}

const CLOUD_ERR = "Quản lý nguồn Zalo chỉ có ở máy thu (cần ~/.openclaw CLI + config)";
const CONFIG = path.join(homedir(), ".openclaw/openclaw.json");
const QR_DIR = "/tmp/openclaw";

const run = promisify(execFile);
const SLUG = /^[a-z0-9][a-z0-9-]{0,30}$/;

type GroupEntry = { enabled?: boolean; allow?: boolean; requireMention?: boolean };
type AccountCfg = {
  enabled?: boolean;
  profile?: string;
  name?: string;
  groupPolicy?: string;
  groupAllowFrom?: string[];
  requireMention?: boolean;
  groups?: Record<string, GroupEntry>;
};
type ZalouserCfg = {
  enabled?: boolean;
  defaultAccount?: string;
  groupPolicy?: string;
  groups?: Record<string, GroupEntry>;
  accounts?: Record<string, AccountCfg>;
};

type Root = { channels?: { zalouser?: ZalouserCfg } };

async function readCfg(): Promise<Root> {
  return JSON.parse(await readFile(CONFIG, "utf8")) as Root;
}

async function writeCfg(cfg: Root): Promise<void> {
  await copyFile(CONFIG, `${CONFIG}.bak-${Date.now()}`);
  await writeFile(CONFIG, JSON.stringify(cfg, null, 2));
}

export type ZaloAccount = {
  accountId: string;
  name: string | null;
  profile: string;
  explicitGroups: boolean; // có groups riêng (không kế thừa channel)
  enabledGroups: string[]; // hiệu dụng sau kế thừa
};

/** Groups hiệu dụng của một account theo đúng semantics merge của OpenClaw. */
function effectiveGroups(z: ZalouserCfg | undefined, accountId: string): {
  explicit: boolean;
  groups: Record<string, GroupEntry>;
} {
  if (!z) return { explicit: false, groups: {} };
  if (accountId === "default") {
    // Layout đa tài khoản: default tường minh trong accounts.default;
    // layout cũ: groups cấp channel
    return { explicit: true, groups: z.accounts?.default?.groups ?? z.groups ?? {} };
  }
  const acc = z.accounts?.[accountId];
  if (acc?.groups) return { explicit: true, groups: acc.groups };
  return { explicit: false, groups: z.groups ?? {} }; // kế thừa!
}

function enabledKeys(groups: Record<string, GroupEntry>): string[] {
  return Object.entries(groups)
    .filter(([, v]) => (v as { allow?: boolean }).allow !== false && v.enabled !== false)
    .map(([k]) => k);
}

export async function listZaloAccounts(): Promise<ZaloAccount[]> {
  if (!isZaloAdminAvailable()) return [];
  const cfg = await readCfg();
  const z = cfg.channels?.zalouser;
  const ids = new Set<string>(["default"]);
  for (const id of Object.keys(z?.accounts ?? {})) ids.add(id);
  return [...ids].map((accountId) => {
    const eff = effectiveGroups(z, accountId);
    const acc = accountId === "default" ? undefined : z?.accounts?.[accountId];
    return {
      accountId,
      name: acc?.name ?? null,
      profile: acc?.profile ?? (accountId === "default" ? "default" : accountId),
      explicitGroups: eff.explicit,
      enabledGroups: enabledKeys(eff.groups),
    };
  });
}

export async function createZaloAccount(accountId: string, name?: string): Promise<ZaloAccount> {
  if (!isZaloAdminAvailable()) throw new Error(CLOUD_ERR);
  if (!SLUG.test(accountId)) throw new Error("id chỉ gồm a-z 0-9 và gạch ngang (≤31 ký tự)");
  const cfg = await readCfg();
  const z = (cfg.channels ??= {}).zalouser ??= {};
  if (z.accounts?.[accountId]) throw new Error(`tài khoản "${accountId}" đã tồn tại`);
  // Có map accounts mà thiếu default tường minh → resolver OpenClaw ngừng tạo
  // implicit default (channel không có key `profile`) → MẤT tài khoản chính!
  // Materialize default với chính groups cấp channel trước khi thêm account.
  if (!z.accounts) z.accounts = {};
  if (!z.accounts.default) {
    z.accounts.default = {
      enabled: true,
      profile: "default",
      ...(z.groupPolicy ? { groupPolicy: z.groupPolicy } : {}),
      groupAllowFrom: ["*"],
      ...(z.groups ? { groups: z.groups } : {}),
    };
  }
  // groups tường minh (rỗng) — chặn kế thừa 4 nhóm của default (bất biến 1-1)
  ((z.accounts ??= {})[accountId] = {
    enabled: true,
    profile: accountId,
    ...(name ? { name } : {}),
    groupPolicy: "allowlist",
    // sender-access: nhóm đã allow thì mọi người gửi trong nhóm đều qua
    // (không có cái này, ingress chặn với "empty allowlist")
    groupAllowFrom: ["*"],
    groups: {},
  });
  await writeCfg(cfg);
  const list = await listZaloAccounts();
  return list.find((a) => a.accountId === accountId)!;
}

export async function deleteZaloAccount(accountId: string): Promise<void> {
  if (!isZaloAdminAvailable()) throw new Error(CLOUD_ERR);
  if (accountId === "default") throw new Error("không xoá được tài khoản default");
  // logout session zca trước (best-effort) để không sót credential mồ côi
  try {
    await run(OPENCLAW, ["channels", "logout", "--channel", "zalouser", "--account", accountId], {
      timeout: 20000,
    });
  } catch {
    /* chưa login / CLI lỗi — vẫn gỡ config */
  }
  const cfg = await readCfg();
  const z = cfg.channels?.zalouser;
  if (!z?.accounts?.[accountId]) return;
  delete z.accounts[accountId];
  await writeCfg(cfg);
}

/**
 * Bật/tắt nhóm cho account với bất biến 1 nhóm – 1 tài khoản.
 * Trả về owner xung đột khi vi phạm (caller trả 409).
 */
export async function setZaloGroupEnabled(
  accountId: string,
  groupId: string,
  enabled: boolean,
): Promise<{ conflictWith: string | null }> {
  if (!isZaloAdminAvailable()) return { conflictWith: null }; // cloud
  const cfg = await readCfg();
  const z = (cfg.channels ??= {}).zalouser ??= {};
  const accounts = await listZaloAccounts();
  const me = accounts.find((a) => a.accountId === accountId);
  if (!me) throw new Error(`tài khoản "${accountId}" chưa tồn tại`);
  if (enabled) {
    const owner = accounts.find(
      (a) => a.accountId !== accountId && a.enabledGroups.includes(groupId),
    );
    if (owner) return { conflictWith: owner.accountId };
  }
  const newEntry = () => ({ enabled, requireMention: false }); // monitor: nhận cả tin không nhắc bot
  if (accountId === "default") {
    const target = z.accounts?.default
      ? ((z.accounts.default.groups ??= {}))
      : ((z.groups ??= {}));
    if (target[groupId]) target[groupId].enabled = enabled;
    else target[groupId] = newEntry();
  } else {
    const acc = (z.accounts ??= {})[accountId] ??= {
      enabled: true,
      profile: accountId,
      groupAllowFrom: ["*"],
    };
    if (acc.groups?.[groupId]) acc.groups[groupId].enabled = enabled;
    else ((acc.groups ??= {})[groupId] = newEntry());
  }
  await writeCfg(cfg);
  return { conflictWith: null };
}

// ---------- Login QR (spawn CLI detached) ----------

type LoginHandle = { child: import("node:child_process").ChildProcess; startedAt: number };
const logins = new Map<string, LoginHandle>();
let statusCache = { at: 0, text: "" as string };

function qrFile(accountId: string): string {
  return path.join(QR_DIR, `openclaw-zalouser-qr-${accountId === "default" ? "default" : accountId}.png`);
}

export async function startZaloLogin(
  accountId: string,
): Promise<{ qrBase64: string | null; startedAt: string }> {
  if (!isZaloAdminAvailable()) throw new Error(CLOUD_ERR);
  const existing = logins.get(accountId);
  if (existing && existing.child.exitCode === null) {
    const b64 = await readQr(accountId);
    return { qrBase64: b64, startedAt: new Date(existing.startedAt).toISOString() };
  }
  const { spawn } = await import("node:child_process");
  const proc = spawn(OPENCLAW, ["channels", "login", "--channel", "zalouser", "--account", accountId], {
    detached: true,
    stdio: "ignore",
  });
  proc.unref();
  logins.set(accountId, { child: proc, startedAt: Date.now() });
  // QR sinh không tức thì — chờ tối đa 20s
  for (let i = 0; i < 20; i++) {
    await new Promise((r) => setTimeout(r, 1000));
    const b64 = await readQr(accountId);
    if (b64) return { qrBase64: b64, startedAt: new Date().toISOString() };
  }
  return { qrBase64: null, startedAt: new Date().toISOString() };
}

async function readQr(accountId: string): Promise<string | null> {
  try {
    const buf = await readFile(qrFile(accountId));
    return buf.toString("base64");
  } catch {
    return null;
  }
}

export async function zaloLoginStatus(accountId: string): Promise<{
  qrBase64: string | null;
  processAlive: boolean;
  connected: boolean | null;
}> {
  if (!isZaloAdminAvailable()) return { qrBase64: null, processAlive: false, connected: null };
  const handle = logins.get(accountId);
  const qrBase64 = await readQr(accountId);
  let connected: boolean | null = null;
  try {
    // CLI ~1.4s — cache stdout 10s cho mọi account (poll 3s không đập CLI)
    let stdout = statusCache.text;
    if (!stdout || Date.now() - statusCache.at > 10_000) {
      stdout = (await run(OPENCLAW, ["channels", "status"], { timeout: 15000 })).stdout;
      statusCache = { at: Date.now(), text: stdout };
    }
    const re = new RegExp(`Zalo Personal(\\s+${accountId})?\\s*:[^\\n]*connected`);
    connected = re.test(stdout);
  } catch {
    /* gateway không trả lời — để null */
  }
  return {
    qrBase64,
    processAlive: !!handle && handle.child.exitCode === null,
    connected,
  };
}

export async function cancelZaloLogin(accountId: string): Promise<void> {
  if (!isZaloAdminAvailable()) return;
  const handle = logins.get(accountId);
  if (handle && handle.child.exitCode === null) handle.child.kill("SIGTERM");
  logins.delete(accountId);
}

// ---------- Directory nhóm (membership thật) ----------

export type ZaloGroupDir = { groupId: string; name: string };

const dirCache = new Map<string, { at: number; rows: ZaloGroupDir[] }>();
const DIR_TTL_MS = 300_000; // membership đổi hiếm — 5 phút

/** Directory nhóm từ Zalo (membership thật). CLI mất ~8s/lượt → cache 5 phút;
 * force=true bỏ cache (nút refresh trên UI). isFresh=false khi cache lạnh —
 * caller có thể kick refresh ngầm thay vì chờ. */
export async function listZaloGroupDirectory(
  accountId: string,
  force = false,
): Promise<ZaloGroupDir[]> {
  if (!isZaloAdminAvailable()) return [];
  const hit = dirCache.get(accountId);
  if (!force && hit && Date.now() - hit.at < DIR_TTL_MS) return hit.rows;
  await refreshZaloGroupDirectory(accountId);
  return dirCache.get(accountId)?.rows ?? [];
}

/** Refresh ngầm: không await — render không bao giờ chờ CLI ~8s. */
export function refreshZaloGroupDirectoryInBackground(accountId: string): void {
  const hit = dirCache.get(accountId);
  if (hit && Date.now() - hit.at < DIR_TTL_MS) return; // còn tươi
  void refreshZaloGroupDirectory(accountId).catch(() => {});
}

/** Đọc snapshot cache (không đợi) — rỗng nếu lạnh. */
export function readCachedDirectory(accountId: string): ZaloGroupDir[] {
  return dirCache.get(accountId)?.rows ?? [];
}

export function directoryCacheIsFresh(accountId: string): boolean {
  const hit = dirCache.get(accountId);
  return !!hit && Date.now() - hit.at < DIR_TTL_MS;
}

async function refreshZaloGroupDirectory(accountId: string): Promise<void> {
  const { stdout } = await run(
    OPENCLAW,
    ["directory", "groups", "list", "--channel", "zalouser", ...(accountId !== "default" ? ["--account", accountId] : [])],
    { timeout: 30000 },
  );
  const rows: ZaloGroupDir[] = [];
  for (const m of stdout.matchAll(/│\s*(group:\S+)\s*│\s*([^│]+?)\s*│/g)) {
    rows.push({ groupId: m[1], name: m[2] });
  }
  dirCache.set(accountId, { at: Date.now(), rows });
}
