import { pool } from "./db";

/** Public build: flow data từ DB trực tiếp (không có local file/CLI reads). */

export type FlowDay = {
  day: string;
  airdnaMarkets: number;
  airdnaListings: number;
  airbnbListingsSeen: number;
  airbnbSnapshots: number;
  zaloPosts: number;
  zaloOffers: number;
};

export async function getFlowDays(n = 7): Promise<FlowDay[]> {
  const { rows } = await pool.query(
    `SELECT d::date::text AS day,
            (SELECT count(*)::int FROM areas WHERE created_at::date = d) AS markets,
            (SELECT count(*)::int FROM listings WHERE last_seen::date = d) AS listings,
            (SELECT count(*)::int FROM sale_offers WHERE first_seen::date = d) AS offers
     FROM generate_series(current_date - ($1::int - 1), current_date, interval '1 day') d
     ORDER BY d DESC`,
    [n],
  );
  return rows.map((r) => ({
    day: r.day,
    airdnaMarkets: r.markets,
    airdnaListings: 0,
    airbnbListingsSeen: r.listings,
    airbnbSnapshots: 0,
    zaloPosts: 0,
    zaloOffers: r.offers,
  }));
}

export type GateFunnel = {
  lastEventAt: string | null;
  today: { messages: number; passed: number; skipped: number; accepted: number; media: number };
  last7: { messages: number; passed: number; skipped: number; accepted: number; media: number };
};

export async function readGateFunnel(): Promise<GateFunnel> {
  return {
    lastEventAt: null,
    today: { messages: 0, passed: 0, skipped: 0, accepted: 0, media: 0 },
    last7: { messages: 0, passed: 0, skipped: 0, accepted: 0, media: 0 },
  };
}

export type ZaloHealth = {
  connected: boolean | null;
  uptime24h: number | null;
  heartbeatAgeMin: number | null;
  lastHeartbeatAt: string | null;
  lastPostAt: string | null;
  silentAlert24h: boolean;
  driftAlert24h: boolean;
};

export async function readZaloHealth(): Promise<ZaloHealth> {
  return {
    connected: null, uptime24h: null, heartbeatAgeMin: null,
    lastHeartbeatAt: null, lastPostAt: null, silentAlert24h: false, driftAlert24h: false,
  };
}

export type JobStatus = {
  id: string; label: string; schedule: string;
  alive: "yes" | "no" | "unknown";
  lastLogAt: string | null; lastLine: string | null;
};

export async function readSchedulerStatus(): Promise<JobStatus[]> {
  return [];
}

export type RotationPreview = {
  updatedAt: string | null; cursor: number; total: number;
  next: { id: string; name: string; lastCapturedAt: string | null }[];
};

export async function readRotationPreview(): Promise<RotationPreview> {
  return { updatedAt: null, cursor: 0, total: 0, next: [] };
}

export type ZaloGroupRow = {
  name: string; isMockOnly: boolean; realPosts7d: number;
  mockPosts7d: number; lastSeenAt: string | null;
  seen: number; passed: number; skipped: number; accepted: number;
  lastEventAt: string | null; ownerAccount: string | null;
};

export async function getZaloGroups(): Promise<ZaloGroupRow[]> {
  return [];
}

export type ZaloAllowlistEntry = { groupId: string; enabled: boolean };
export async function readZaloAllowlist(): Promise<ZaloAllowlistEntry[]> {
  return [];
}

export async function getFactsPushedAt(): Promise<string | null> {
  return null;
}
