import { pool } from "./db";

// Tiền tệ theo QUỐC GIA (tiền tố của area id): mọi thị trường VN là VND.
const CURRENCY: Record<string, string> = { vn: "VND" }; // ADR-0008: scope VN
export function currencyFor(areaId: string): string {
  return CURRENCY[areaId.split("-")[0]] ?? "USD";
}

export type Area = {
  id: string;
  parentId: string | null;
  regionType: string;
  name: string;
  parentName: string | null;
  lat: number;
  lng: number;
};

export async function getArea(areaId: string): Promise<Area | null> {
  const { rows } = await pool.query(
    `SELECT a.id, a.parent_id, a.region_type, a.name, p.name AS parent_name,
            ST_Y(ST_Centroid(a.geom)) AS lat, ST_X(ST_Centroid(a.geom)) AS lng
     FROM areas a LEFT JOIN areas p ON p.id = a.parent_id
     WHERE a.id = $1`,
    [areaId],
  );
  const r = rows[0];
  return r
    ? {
        id: r.id,
        parentId: r.parent_id,
        regionType: r.region_type,
        name: r.name,
        parentName: r.parent_name,
        lat: Number(r.lat),
        lng: Number(r.lng),
      }
    : null;
}

/** Slug bỏ dấu tiếng Việt (khớp slugify của pipeline/transform-airbnb.mjs). */
function slugifyName(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Resolve submarket theo slug tên (URL thân thiện, không phụ thuộc id nội bộ). */
export async function resolveSubmarketId(
  marketId: string,
  subSlug: string,
): Promise<string | null> {
  const { rows } = await pool.query(
    `SELECT id, name FROM areas
     WHERE region_type = 'submarket' AND parent_id = $1`,
    [marketId],
  );
  const hit = rows.find((r) => slugifyName(r.name) === subSlug);
  return hit?.id ?? null;
}

export type SearchEntry = {
  id: string;
  kind: "market" | "submarket";
  name: string;
  parentName: string | null;
  slug: string; // ASCII, dùng cho tìm kiếm không dấu
  href: string;
};

/** Chỉ mục tìm kiếm ⌘K: mọi market + submarket, đường dẫn theo slug tên. */
export async function getSearchIndex(): Promise<SearchEntry[]> {
  const { rows } = await pool.query(
    `SELECT a.id, a.region_type, a.name, a.parent_id, p.name AS parent_name
     FROM areas a LEFT JOIN areas p ON p.id = a.parent_id
     WHERE a.region_type IN ('market', 'submarket')
     ORDER BY a.region_type, a.name`,
  );
  return rows.map((r) => {
    const marketId: string = r.parent_id ?? r.id;
    const [country, ...rest] = marketId.split("-");
    const marketPath = `/${country}/${rest.join("-")}`;
    const slug = slugifyName(r.name);
    const isMarket = r.region_type === "market";
    return {
      id: r.id,
      kind: isMarket ? "market" : "submarket",
      name: r.name,
      parentName: r.parent_name,
      slug,
      href: isMarket ? marketPath : `${marketPath}/${slug}`,
    };
  });
}

export type MetricRow = {
  month: string; // YYYY-MM-DD
  listingCount: number;
  revenue: number;
  adr: number | null;
  occupancy: number | null;
  revpar: number | null;
  bookedNights: number;
  availableNights: number;
};

export async function getMetrics(areaId: string): Promise<MetricRow[]> {
  const { rows } = await pool.query(
    `SELECT month::text, listing_count, revenue, adr, occupancy, revpar,
            booked_nights, available_nights
     FROM market_metrics WHERE area_id = $1 ORDER BY month`,
    [areaId],
  );
  return rows.map((r) => ({
    month: r.month,
    listingCount: Number(r.listing_count),
    revenue: Number(r.revenue),
    adr: r.adr === null ? null : Number(r.adr),
    occupancy: r.occupancy === null ? null : Number(r.occupancy),
    revpar: r.revpar === null ? null : Number(r.revpar),
    bookedNights: Number(r.booked_nights ?? 0),
    availableNights: Number(r.available_nights ?? 0),
  }));
}

/** KPI rollup trên toàn bộ cửa sổ dữ liệu (mirror KPI strip AirDNA). */
export async function getKpis(areaId: string) {
  const { rows } = await pool.query(
    `SELECT sum(revenue) AS revenue,
            sum(booked_nights) AS booked,
            sum(available_nights) AS avail,
            max(listing_count) AS listings,
            sum(revenue) / nullif(sum(booked_nights), 0) AS adr,
            sum(booked_nights)::numeric /
              nullif(sum(booked_nights) + sum(available_nights), 0) AS occ
     FROM market_metrics WHERE area_id = $1`,
    [areaId],
  );
  const r = rows[0];
  return {
    revenue: Number(r.revenue ?? 0),
    listings: Number(r.listings ?? 0),
    adr: r.adr === null ? null : Number(r.adr),
    occupancy: r.occ === null ? null : Number(r.occ),
  };
}

/**
 * Benchmark so với các submarket anh em trên CẢ cửa sổ dữ liệu (mirror
 * metric_percentiles). Không dùng tháng mới nhất: dữ liệu là lịch tương lai nên
 * tháng xa nhất gần như chưa có booking.
 */
export async function getSiblingBenchmark(areaId: string) {
  const q = `
    WITH win AS (
      SELECT mm.area_id,
             sum(mm.revenue) / nullif(sum(mm.booked_nights), 0) AS adr,
             sum(mm.booked_nights)::numeric
               / nullif(sum(mm.booked_nights) + sum(mm.available_nights), 0) AS occupancy
      FROM market_metrics mm
      JOIN areas a ON a.id = mm.area_id
      WHERE a.parent_id = (SELECT parent_id FROM areas WHERE id = $1)
      GROUP BY mm.area_id
    )
    SELECT
      -- ADR = 0: có đêm đặt nhưng chưa có giá — loại khỏi phân vị.
      percentile_cont(array[0.3, 0.6, 0.9]) WITHIN GROUP (ORDER BY adr)
        FILTER (WHERE adr > 0) AS adr_p,
      percentile_cont(array[0.3, 0.6, 0.9]) WITHIN GROUP (ORDER BY occupancy)
        FILTER (WHERE occupancy IS NOT NULL) AS occ_p,
      count(*) AS n,
      max(adr) FILTER (WHERE area_id = $1) AS my_adr,
      max(occupancy) FILTER (WHERE area_id = $1) AS my_occ
    FROM win`;
  const { rows } = await pool.query(q, [areaId]);
  const r = rows[0];
  if (!r || !r.adr_p || Number(r.n) < 3) return null;
  return {
    nSiblings: Number(r.n),
    adr: { p: (r.adr_p as number[]).map(Number), mine: r.my_adr === null ? null : Number(r.my_adr) },
    occ: { p: (r.occ_p as number[]).map(Number), mine: r.my_occ === null ? null : Number(r.my_occ) },
  };
}

export type SiblingBenchmark = NonNullable<Awaited<ReturnType<typeof getSiblingBenchmark>>>;

type MapFeature = {
  type: "Feature";
  properties: { name: string; active: boolean };
  geometry: unknown;
};/** GeoJSON simplified các submarket của market (cho mini-map, không cần basemap). */
export async function getMarketGeoJson(
  marketId: string,
  activeAreaId: string,
): Promise<{ features: MapFeature[]; lat: number; lng: number } | null> {
  const { rows } = await pool.query(
    `SELECT id, name,
            ST_AsGeoJSON(ST_SimplifyPreserveTopology(geom, 0.002)) AS geojson,
            ST_Y(ST_Centroid(geom)) AS lat, ST_X(ST_Centroid(geom)) AS lng
     FROM areas
     WHERE id = $1 OR parent_id = $1`,
    [marketId],
  );
  if (rows.length === 0) return null;
  const features: MapFeature[] = rows
    .filter((r) => r.geojson)
    .map((r) => ({
      type: "Feature" as const,
      properties: { name: r.name, active: r.id === activeAreaId },
      geometry: JSON.parse(r.geojson),
    }));
  const anchor = rows.find((r) => r.id === activeAreaId) ?? rows[0];
  return {
    features,
    lat: Number(anchor?.lat ?? 13.75),
    lng: Number(anchor?.lng ?? 100.5),
  };
}

// ---------- Finder (IA §3.2): xếp hạng + choropleth, chung cho Insight ----------

export type FinderRow = {
  id: string;
  name: string;
  parentName: string | null;
  href: string;
  listings: number;
  /** Tổng cả cửa sổ; ADR/công suất/RevPAR gộp theo trọng số đêm. */
  revenue: number;
  adr: number | null;
  occupancy: number | null;
  revpar: number | null;
  /** Doanh thu theo tháng, cũ trước — cho sparkline. */
  series: number[];
  lat: number;
  lng: number;
  geometry: unknown | null;
};

/**
 * Khu vực để xếp hạng: các market của một quốc gia, hoặc các submarket của một
 * market. Cùng công thức với getKpis để số khớp giữa Finder và Insight.
 */
export async function getFinderAreas(
  scope: { country: string } | { marketId: string } | { ids: string[] },
  { geometry = true }: { geometry?: boolean } = {},
): Promise<FinderRow[]> {
  const isCountry = "country" in scope;
  const isIds = "ids" in scope;
  if (isIds && scope.ids.length === 0) return [];
  const { rows } = await pool.query(
    `WITH a AS (
       SELECT a.id, a.name, a.parent_id, p.name AS parent_name,
              CASE WHEN $2 THEN ST_AsGeoJSON(ST_SimplifyPreserveTopology(a.geom, $3)) END AS geojson,
              ST_Y(ST_Centroid(a.geom)) AS lat, ST_X(ST_Centroid(a.geom)) AS lng
       FROM areas a LEFT JOIN areas p ON p.id = a.parent_id
       WHERE ${
         isCountry
           ? "a.region_type = 'market' AND a.id LIKE $1 || '-%'"
           : isIds
             ? "a.id = ANY($1::text[])"
             : "a.parent_id = $1"
       }
     ), agg AS (
       SELECT area_id,
              max(listing_count) AS listings,
              sum(revenue) AS revenue,
              sum(booked_nights) AS booked,
              sum(booked_nights) + sum(available_nights) AS nights,
              array_agg(revenue ORDER BY month) AS series
       FROM market_metrics WHERE area_id IN (SELECT id FROM a)
       GROUP BY area_id
     )
     SELECT a.*, agg.listings, agg.revenue, agg.booked, agg.nights, agg.series
     FROM a JOIN agg ON agg.area_id = a.id
     ORDER BY agg.revenue DESC`,
    [
      isCountry ? scope.country : isIds ? scope.ids : scope.marketId,
      geometry,
      isCountry ? 0.01 : 0.002,
    ],
  );
  return rows.map((r) => {
    const revenue = Number(r.revenue ?? 0);
    const booked = Number(r.booked ?? 0);
    const nights = Number(r.nights ?? 0);
    const marketId: string = r.parent_id ?? r.id;
    const [cc, ...rest] = marketId.split("-");
    const marketPath = `/${cc}/${rest.join("-")}`;
    return {
      id: r.id,
      name: r.name,
      parentName: r.parent_name,
      href: r.parent_id ? `${marketPath}/${slugifyName(r.name)}` : marketPath,
      listings: Number(r.listings ?? 0),
      revenue,
      // Có đêm đặt mà doanh thu 0 = chưa có giá: ADR và RevPAR là "chưa biết",
      // không phải 0 (nếu không sẽ xếp cuối như thể ế khách).
      adr: booked > 0 && revenue > 0 ? revenue / booked : null,
      occupancy: nights > 0 ? booked / nights : null,
      revpar: nights > 0 && (revenue > 0 || booked === 0) ? revenue / nights : null,
      series: (r.series as (string | number)[]).map(Number),
      lat: Number(r.lat),
      lng: Number(r.lng),
      geometry: r.geojson ? JSON.parse(r.geojson) : null,
    };
  });
}

/** Market của một quốc gia (cho bộ chọn thị trường của Finder). */
export async function getCountryMarkets(country: string) {
  const { rows } = await pool.query<{ id: string; name: string }>(
    `SELECT id, name FROM areas
     WHERE region_type = 'market' AND id LIKE $1 || '-%' ORDER BY name`,
    [country],
  );
  return rows;
}

// ---------- P2: supply growth (từ stg discovery snapshots) ----------

export type SupplyPoint = {
  snapshotId: string;
  date: string;
  seen: number; // listings snapshot thấy
  newVsPrev: number; // id mới so với snapshot trước đó
};

/**
 * Lịch sử discovery theo city + tổng unique từng thấy.
 * Lưu ý trung thực: search-paging xáo trộn giữa các lần chạy → new/removed
 * là "mới xuất hiện/không còn thấy", không hẳn listing mới thật.
 */
export async function getSupplyHistory(
  marketAreaId: string,
): Promise<{ points: SupplyPoint[]; cumulative: number } | null> {
  const city = marketAreaId.split("-").slice(1).join("-"); // 'vn-hanoi' → 'hanoi'
  const { rows } = await pool.query(
    `SELECT d.snapshot_id,
            to_char(min(a.collected_at), 'YYYY-MM-DD HH24:MI') AS date,
              array_agg(DISTINCT d.listing_id) AS ids
     FROM stg_abnb_discovery d JOIN airbnb_snapshots a ON a.snapshot_id = d.snapshot_id
     WHERE a.city = $1
     GROUP BY d.snapshot_id ORDER BY min(a.collected_at)`,
    [city],
  );
  if (rows.length === 0) return null;
  // đơn giản hoá: tính new bằng JS để tránh SQL rối
  const seen = new Set<string>();
  const points: SupplyPoint[] = [];
  for (const r of rows) {
    const ids: string[] = r.ids ?? [];
    let fresh = 0;
    for (const id of ids) if (!seen.has(id)) fresh++;
    ids.forEach((i) => seen.add(i));
    points.push({
      snapshotId: r.snapshot_id,
      date: r.date,
      seen: ids.length,
      newVsPrev: fresh,
    });
  }
  return { points, cumulative: seen.size };
}


export type BreakdownRow = {
  label: string;
  listings: number;
  revenue: number;
  adr: number | null;
  occupancy: number | null;
  share: number; // tỷ trọng revenue trong tổng
};

export type TopListingRow = {
  id: string;
  name: string | null;
  bedrooms: number | null;
  roomType: string | null;
  adr: number | null;
  occupancy: number | null;
  revenue: number;
};

export type AreaBreakdown = {
  bedrooms: BreakdownRow[];
  roomTypes: BreakdownRow[];
  topListings: TopListingRow[];
};

/**
 * Đọc 3 breakdown từ bảng cache area_breakdowns (precompute bởi
 * pipeline/sql/400_breakdowns.sql) — không quét nights runtime.
 */
export async function getAreaBreakdown(areaId: string): Promise<AreaBreakdown> {
  const { rows } = await pool.query(
    `SELECT kind, label, payload FROM area_breakdowns WHERE area_id = $1`,
    [areaId],
  );
  const beds: Record<string, unknown>[] = [];
  const rtypes: Record<string, unknown>[] = [];
  const tops: Record<string, unknown>[] = [];
  for (const r of rows) {
    const p = r.payload as Record<string, string | number | null>;
    const row = { label: r.label, ...p };
    if (r.kind === "bedrooms") beds.push(row);
    else if (r.kind === "roomTypes") rtypes.push(row);
    else if (r.kind === "topListings") tops.push(row);
  }
  const order = ["Studio", "1", "2", "3", "4+", "N/A"];
  beds.sort((a, b) => order.indexOf(String(a.label)) - order.indexOf(String(b.label)));
  rtypes.sort((a, b) => Number(b.revenue ?? 0) - Number(a.revenue ?? 0));
  tops.sort((a, b) => Number(b.revenue ?? 0) - Number(a.revenue ?? 0));

  const withShare = (arr: Record<string, unknown>[]): BreakdownRow[] => {
    const total = arr.reduce<number>((s, x) => s + Number(x.revenue ?? 0), 0);
    return arr.map((b) => ({
      label: String(b.label),
      listings: Number(b.listings ?? 0),
      revenue: Number(b.revenue ?? 0),
      adr: b.adr === null || b.adr === undefined ? null : Number(b.adr),
      occupancy: b.occupancy === null || b.occupancy === undefined ? null : Number(b.occupancy),
      share: total > 0 ? Number(b.revenue ?? 0) / total : 0,
    }));
  };
  return {
    bedrooms: withShare(beds),
    roomTypes: withShare(rtypes),
    topListings: tops.map((x) => ({
      id: String(x.id),
      name: x.name === null || x.name === undefined ? null : String(x.name),
      bedrooms: x.bedrooms === null || x.bedrooms === undefined ? null : Number(x.bedrooms),
      roomType: x.room_type === null || x.room_type === undefined ? null : String(x.room_type),
      adr: x.adr === null || x.adr === undefined ? null : Number(x.adr),
      occupancy: x.occupancy === null || x.occupancy === undefined ? null : Number(x.occupancy),
      revenue: Number(x.revenue ?? 0),
    })),
  };
}

// ---------- G0-d: chi tiết 1 listing ----------

export type ListingDetail = {
  id: string;
  name: string | null;
  roomType: string | null;
  propertyType: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  accommodates: number | null;
  minimumNights: number | null;
  priceListed: number | null;
  /** URL ảnh CDN (đường dẫn gốc, render thêm ?im_w=) — null khi snapshot cũ thiếu. */
  photoUrls: string[] | null;
  photoSource: "self" | "airdna" | null; // G1: fallback ảnh AirDNA khi tự thu thiếu
  listingUrl: string | null; // link Airbnb gốc (từ AirDNA)
  reviewCount: number | null;
  lat: number | null;
  lng: number | null;
  areaId: string | null;
  areaName: string | null;
  /** Đường dẫn Insight của phường, vd "/vn/hanoi/quan-tay-ho". */
  areaPath: string | null;
  marketName: string | null;
  marketPath: string | null; // vd "/vn/hanoi"
  currency: string;
  lastSeen: string | null;
  stats: { nights: number; booked: number; revenue: number; occupancy: number | null };
  calendar: { night: string; available: boolean | null; price: number | null }[];
};

export async function getListingDetail(id: string): Promise<ListingDetail | null> {
  const { rows } = await pool.query(
    `SELECT l.*, l.last_seen::text AS last_seen_text,
            a.name AS area_name, a.id AS area_id, a.region_type AS area_type,
            p.id AS parent_id, p.name AS parent_name
     FROM listings l
     LEFT JOIN areas a ON a.id = l.area_id
     LEFT JOIN areas p ON p.id = a.parent_id
     WHERE l.id = $1`,
    [id],
  );
  const r = rows[0];
  if (!r) return null;

  const { rows: nightRows } = await pool.query(
    `SELECT night::text, available, price FROM nights WHERE listing_id = $1 ORDER BY night`,
    [id],
  );

  // G1: listing chưa có ảnh (tự thu thiếu/PDP chưa fetch) → mượn ảnh AirDNA
  // của cùng căn (id trùng abnb_*), kèm URL Airbnb gốc.
  let photoUrls: string[] | null = Array.isArray(r.photo_urls) ? r.photo_urls : null;
  let photoSource: "self" | "airdna" | null = photoUrls ? "self" : null;
  let listingUrl: string | null = null;
  if (!photoUrls) {
    const { rows: al } = await pool.query(
      `SELECT photo_urls, listing_url FROM airdna_listings WHERE id = $1 AND photo_urls IS NOT NULL LIMIT 1`,
      [id],
    );
    if (al[0]?.photo_urls?.length) {
      photoUrls = al[0].photo_urls;
      photoSource = "airdna";
      listingUrl = al[0].listing_url ?? null;
    }
  } else {
    const { rows: al } = await pool.query(
      `SELECT listing_url FROM airdna_listings WHERE id = $1 AND listing_url IS NOT NULL LIMIT 1`,
      [id],
    );
    listingUrl = al[0]?.listing_url ?? null;
  }
  const booked = nightRows.filter((n) => n.available === false);
  // Listing không giá nằm ngoài mẫu metrics (pipeline/sql/300_metrics.sql): lịch
  // "kín" của nó phần lớn là bị chặn, không phải đặt thật → công suất là "chưa biết".
  const stats = {
    nights: nightRows.length,
    booked: booked.length,
    revenue: booked.reduce((sum, n) => sum + Number(n.price ?? 0), 0),
    occupancy:
      r.price_listed !== null && nightRows.length > 0 ? booked.length / nightRows.length : null,
  };

  // Market = cha của phường; listing gán thẳng vào market thì chính nó.
  const marketId: string | null =
    r.area_type === "submarket" ? r.parent_id : r.area_type === "market" ? r.area_id : null;
  const marketPath = marketId
    ? `/${marketId.split("-")[0]}/${marketId.split("-").slice(1).join("-")}`
    : null;
  const areaPath =
    r.area_type === "submarket" && marketPath ? `${marketPath}/${slugifyName(r.area_name)}` : marketPath;

  return {
    id: r.id,
    name: r.name,
    photoUrls,
    photoSource,
    listingUrl,
    reviewCount: r.review_count ?? null,
    roomType: r.room_type,
    propertyType: r.property_type,
    bedrooms: r.bedrooms,
    bathrooms: r.bathrooms === null ? null : Number(r.bathrooms),
    accommodates: r.accommodates,
    minimumNights: r.minimum_nights,
    priceListed: r.price_listed === null ? null : Number(r.price_listed),
    lat: r.latitude === null ? null : Number(r.latitude),
    lng: r.longitude === null ? null : Number(r.longitude),
    areaId: r.area_id,
    areaName: r.area_type === "submarket" ? r.area_name : null,
    areaPath,
    marketName: r.area_type === "submarket" ? r.parent_name : r.area_name,
    marketPath,
    currency: currencyFor(marketId ?? r.area_id ?? "vn"),
    lastSeen: r.last_seen_text,
    stats,
    calendar: nightRows.map((n) => ({
      night: n.night,
      available: n.available,
      price: n.price === null ? null : Number(n.price),
    })),
  };
}

/**
 * Phân vị giá niêm yết và công suất của các listing cùng khu vực (để đặt một
 * listing vào bối cảnh). Dưới 5 listing cùng phường thì so cả thị trường.
 */
export async function getListingPeers(areaId: string, marketId: string | null) {
  const q = (scope: string) => `
    WITH peers AS (
      SELECT l.id, l.price_listed, st.occupancy AS occ
      FROM listings l LEFT JOIN listing_stats st ON st.listing_id = l.id
      WHERE ${scope}
    )
    SELECT count(*) AS n,
           percentile_cont(array[0.3, 0.6, 0.9]) WITHIN GROUP (ORDER BY price_listed)
             FILTER (WHERE price_listed > 0) AS price_p,
           percentile_cont(array[0.3, 0.6, 0.9]) WITHIN GROUP (ORDER BY occ)
             FILTER (WHERE occ IS NOT NULL) AS occ_p
    FROM peers`;
  const read = (r: Record<string, unknown> | undefined, scope: "area" | "market") =>
    r && Number(r.n) >= 5 && r.price_p
      ? {
          scope,
          n: Number(r.n),
          price: (r.price_p as number[]).map(Number),
          occ: r.occ_p ? (r.occ_p as number[]).map(Number) : null,
        }
      : null;
  const area = read((await pool.query(q("l.area_id = $1"), [areaId])).rows[0], "area");
  if (area || !marketId) return area;
  return read(
    (
      await pool.query(
        q("l.area_id IN (SELECT id FROM areas WHERE id = $1 OR parent_id = $1)"),
        [marketId],
      )
    ).rows[0],
    "market",
  );
}

export type ListingCardRow = {
  id: string;
  name: string | null;
  roomType: string | null;
  bedrooms: number | null;
  accommodates: number | null;
  priceListed: number | null;
  areaName: string | null;
  areaPath: string | null;
  lat: number;
  lng: number;
  booked: number;
  nights: number;
  occupancy: number | null;
  revenue: number;
};

/**
 * Listing của một thị trường cho trang Duyệt listing (lưới thẻ + bản đồ nhãn
 * giá). Lọc theo phường / số phòng ngủ / loại trừ một id dùng cho "listing tương tự".
 * Số đêm / đặt / doanh thu đọc từ listing_stats (pipeline/sql/410_listing_stats.sql)
 * — không gộp nights runtime.
 */
export async function getMarketListings(
  marketId: string,
  {
    limit = 300,
    areaId,
    excludeId,
    bedrooms,
    near,
  }: {
    limit?: number;
    areaId?: string;
    excludeId?: string;
    bedrooms?: number | null;
    /** Lấy `limit` listing gần điểm này nhất (comps). */
    near?: { lat: number; lng: number };
  } = {},
): Promise<{ rows: ListingCardRow[]; total: number }> {
  const [cc, ...rest] = marketId.split("-");
  const marketPath = `/${cc}/${rest.join("-")}`;
  const { rows } = await pool.query(
    `WITH ls AS (
       SELECT l.*, a.name AS area_name, a.region_type
       FROM listings l JOIN areas a ON a.id = l.area_id
       WHERE (a.id = $1 OR a.parent_id = $1)
         AND l.latitude IS NOT NULL
         AND ($3::text IS NULL OR l.area_id = $3)
         AND ($4::text IS NULL OR l.id <> $4)
         AND ($5::int IS NULL OR l.bedrooms = $5)
       ORDER BY CASE WHEN $6::float8 IS NULL THEN 0
                     ELSE (l.latitude - $6) ^ 2 + ((l.longitude - $7) * cos(radians($6))) ^ 2 END
       LIMIT CASE WHEN $6::float8 IS NULL THEN NULL ELSE $2::int END
     )
     SELECT ls.id, ls.name, ls.room_type, ls.bedrooms, ls.accommodates, ls.price_listed,
            ls.area_name, ls.region_type, ls.latitude, ls.longitude,
            COALESCE(st.nights, 0) AS nights, COALESCE(st.booked, 0) AS booked,
            COALESCE(st.revenue, 0) AS revenue,
            count(*) OVER () AS total
     FROM ls LEFT JOIN listing_stats st ON st.listing_id = ls.id
     ORDER BY COALESCE(st.revenue, 0) DESC, COALESCE(st.booked, 0) DESC, ls.id
     LIMIT $2::int`,
    [marketId, limit, areaId ?? null, excludeId ?? null, bedrooms ?? null, near?.lat ?? null, near?.lng ?? null],
  );
  return {
    total: Number(rows[0]?.total ?? 0),
    rows: rows.map((r) => {
      const nights = Number(r.nights);
      const booked = Number(r.booked);
      return {
        id: r.id,
        name: r.name,
        roomType: r.room_type,
        bedrooms: r.bedrooms,
        accommodates: r.accommodates,
        priceListed: r.price_listed === null ? null : Number(r.price_listed),
        areaName: r.region_type === "submarket" ? r.area_name : null,
        areaPath: r.region_type === "submarket" ? `${marketPath}/${slugifyName(r.area_name)}` : null,
        lat: Number(r.latitude),
        lng: Number(r.longitude),
        booked,
        nights,
        occupancy: nights > 0 ? booked / nights : null,
        revenue: Number(r.revenue),
      };
    }),
  };
}

// ---------- G1: asset stats + yield ----------

export type YieldRow = {
  areaId: string;
  name: string;
  slug: string;
  nSale: number;
  medianPerm2: number | null; // VND/m²
  nRentLt: number;
  medianRentLt: number | null; // VND/tháng
  strRevenueMonth: number | null; // một căn/tháng: trung vị giá × công suất 90 đêm đầu
  yieldStr: number | null; // (strRevenueMonth × 12) / (medianPerm2 × 60m²) — giả định 60m²
  yieldLt: number | null; // (medianRentLt × 12) / (medianPerm2 × 60m²)
};

/** Yield theo submarket — kết hợp market_asset_stats (bán/thuê) + market_metrics (STR). */
export async function getYieldRows(marketId: string): Promise<YieldRow[]> {
  // Doanh thu ngắn hạn của MỘT căn/tháng = trung vị (giá niêm yết × công suất
  // 90 đêm đầu) × 365/12 trên các listing của phường — cùng mô hình với /yield.
  // (Bản cũ lấy ADR × số listing = doanh thu cả phường, thổi phồng yield.)
  // nights90/booked90 tính sẵn trong listing_stats (pipeline/sql/410_listing_stats.sql):
  // lịch tương lai thưa dần về cuối (Hà Nội: 28,6% ở 90 đêm đầu vs 14,4% cả 365).
  const { rows } = await pool.query(
    `WITH cand AS (
       SELECT l.id, l.area_id, l.price_listed FROM listings l
       JOIN areas a ON a.id = l.area_id
       WHERE a.parent_id = $1 AND l.price_listed > 0
     ), str AS (
       SELECT c.area_id,
              percentile_cont(0.5) WITHIN GROUP (
                ORDER BY c.price_listed * p.booked90::numeric / nullif(p.nights90, 0)
              ) * 365 / 12 AS str_month,
              count(*) AS n
       FROM cand c JOIN listing_stats p ON p.listing_id = c.id
       GROUP BY c.area_id
     ), sales AS (
       SELECT area_id, n_offers, median_perm2 FROM market_asset_stats WHERE kind = 'sale'
     ), rents AS (
       SELECT area_id, n_offers, median_rent FROM market_asset_stats WHERE kind = 'rent_lt'
     )
     SELECT a.id, a.name, s.n_offers AS n_sale, s.median_perm2,
            r.n_offers AS n_rent_lt, r.median_rent, str.str_month
     FROM areas a
     LEFT JOIN sales s ON s.area_id = a.id
     LEFT JOIN rents r ON r.area_id = a.id
     LEFT JOIN str ON str.area_id = a.id
     WHERE a.parent_id = $1 AND (s.area_id IS NOT NULL OR r.area_id IS NOT NULL)
     ORDER BY s.median_perm2 DESC NULLS LAST`,
    [marketId],
  );
  return rows.map((r) => {
    const slug = slugifyName(r.name);
    const ASSUMED_M2 = 60; // giả định căn hộ 60m² để tính yield
    const salePrice = r.median_perm2 ? Number(r.median_perm2) * ASSUMED_M2 : null;
    const strMonth = r.str_month ? Number(r.str_month) : null;
    const rentLt = r.median_rent ? Number(r.median_rent) : null;
    return {
      areaId: r.id,
      name: r.name,
      slug,
      nSale: Number(r.n_sale ?? 0),
      medianPerm2: r.median_perm2 === null ? null : Number(r.median_perm2),
      nRentLt: Number(r.n_rent_lt ?? 0),
      medianRentLt: r.median_rent === null ? null : Number(r.median_rent),
      strRevenueMonth: strMonth,
      yieldStr: salePrice && strMonth ? (strMonth * 12) / salePrice : null,
      yieldLt: salePrice && rentLt ? (rentLt * 12) / salePrice : null,
    };
  });
}

// ---------- P4: ước tính lợi suất (/yield) ----------

export type YieldArea = {
  id: string;
  name: string;
  listings: number;
  medianPerm2: number | null;
  rentLt: number | null;
};

/** Thị trường có dữ liệu bán/thuê (hiện là mô phỏng G1) — /yield chỉ chạy ở đó. */
export async function getYieldMarkets() {
  const { rows } = await pool.query<{ id: string; name: string }>(
    `SELECT DISTINCT m.id, m.name
     FROM market_asset_stats s
     JOIN areas a ON a.id = s.area_id
     JOIN areas m ON m.id = a.parent_id
     ORDER BY m.name`,
  );
  return rows;
}

/** Phường của một thị trường cho form: số listing + giá bán/m², giá thuê (mô phỏng). */
export async function getYieldAreas(marketId: string): Promise<YieldArea[]> {
  const { rows } = await pool.query(
    `SELECT a.id, a.name,
            (SELECT count(*) FROM listings l WHERE l.area_id = a.id) AS listings,
            (SELECT median_perm2 FROM market_asset_stats WHERE area_id = a.id AND kind = 'sale') AS perm2,
            (SELECT median_rent FROM market_asset_stats WHERE area_id = a.id AND kind = 'rent_lt') AS rent
     FROM areas a
     WHERE a.parent_id = $1 AND a.region_type = 'submarket'
     ORDER BY a.name`,
    [marketId],
  );
  return rows
    .map((r) => ({
      id: r.id,
      name: r.name,
      listings: Number(r.listings),
      medianPerm2: r.perm2 === null ? null : Number(r.perm2),
      rentLt: r.rent === null ? null : Number(r.rent),
    }))
    .filter((a) => a.listings > 0 || a.medianPerm2 !== null);
}

export type YieldCompRow = ListingCardRow & { occupancy90: number | null };

/**
 * Listing so sánh cho ước tính: cùng phường + số phòng ngủ (≥ 5), lùi về cả
 * thị trường cùng số phòng ngủ, rồi cả thị trường. Chỉ listing có giá niêm yết.
 * Công suất 90 đêm đầu đọc từ listing_stats như getYieldRows.
 */
export async function getYieldComps(
  marketId: string,
  areaId: string,
  bedrooms: number,
): Promise<{ scope: "area-bedrooms" | "market-bedrooms" | "market"; rows: YieldCompRow[] }> {
  const [cc, ...rest] = marketId.split("-");
  const marketPath = `/${cc}/${rest.join("-")}`;
  const run = async (where: string, params: unknown[]) => {
    const { rows } = await pool.query(
      `WITH cand AS (
         SELECT l.*, a.name AS area_name, a.region_type
         FROM listings l JOIN areas a ON a.id = l.area_id
         WHERE (a.id = $1 OR a.parent_id = $1) AND l.price_listed > 0 AND ${where}
       )
       SELECT cand.id, cand.name, cand.room_type, cand.bedrooms, cand.accommodates,
              cand.price_listed, cand.area_name, cand.region_type, cand.latitude, cand.longitude,
              p.nights, p.booked, p.nights90, p.booked90
       FROM cand JOIN listing_stats p ON p.listing_id = cand.id
       ORDER BY p.booked90 DESC, cand.id`,
      [marketId, ...params],
    );
    return rows.map((r): YieldCompRow => {
      const nights = Number(r.nights);
      const booked = Number(r.booked);
      const n90 = Number(r.nights90);
      return {
        id: r.id,
        name: r.name,
        roomType: r.room_type,
        bedrooms: r.bedrooms,
        accommodates: r.accommodates,
        priceListed: Number(r.price_listed),
        areaName: r.region_type === "submarket" ? r.area_name : null,
        areaPath: r.region_type === "submarket" ? `${marketPath}/${slugifyName(r.area_name)}` : null,
        lat: Number(r.latitude),
        lng: Number(r.longitude),
        booked,
        nights,
        occupancy: nights > 0 ? booked / nights : null,
        revenue: 0,
        occupancy90: n90 > 0 ? Number(r.booked90) / n90 : null,
      };
    });
  };
  const inArea = await run("l.area_id = $2 AND l.bedrooms = $3", [areaId, bedrooms]);
  if (inArea.length >= 5) return { scope: "area-bedrooms", rows: inArea };
  const sameBeds = await run("l.bedrooms = $2", [bedrooms]);
  if (sameBeds.length >= 5) return { scope: "market-bedrooms", rows: sameBeds };
  return { scope: "market", rows: await run("TRUE", []) };
}

// ---------- G2: AirDNA đối chiếu ----------
// CHỈ dùng trong Ops Portal (/ops/quality) — AirDNA là nguồn hiệu chuẩn, không
// hiển thị cho nhà đầu tư (CLAUDE.md "Don't", IA rủi ro R1).

export type TruthfulCoverageRow = {
  areaId: string;
  name: string;
  ourListings: number;
  airdnaActive: number;
  airdnaPeriod: string | null;
  airdnaUniverse: number; // map_listings đã mua (đầy đủ market)
  historyMonths: number; // độ sâu timeseries AirDNA đã lưu
  capturedAt: string | null;
  ratio: number | null; // our / airdna active
  nMarkets: number; // số market AirDNA ghép vào area (sáp nhập tỉnh 2025)
};

/**
 * Độ phủ trung thực (E2 C2/D): listing tự thu ÷ listing active AirDNA của
 * cùng market (crosswalk S02). Tự thu là mẫu discovery theo thiết kế — tỉ lệ
 * này nói độ sâu hiệu chuẩn, KHÔNG phải độ phủ "thị trường đã quét hết".
 *
 * Sáp nhập tỉnh 2025: MỘT area mới ghép từ nhiều market AirDNA cũ (TPHCM =
 * 48 + Bình Dương + Vũng Tàu + Côn Đảo). Địa lý các tỉnh cũ không giao nhau
 * nên mẫu số = TỔNG active listings của mọi market thành phần.
 */
export async function getTruthfulCoverage(): Promise<TruthfulCoverageRow[]> {
  const [xw, active, uni, hist, cap, ours] = await Promise.all([
    pool.query(
      `SELECT x.area_id, a.name, x.source_area_key
         FROM area_sources x JOIN areas a ON a.id = x.area_id
        WHERE x.source = 'S02' ORDER BY a.name`,
    ),
    pool.query(
      `SELECT DISTINCT ON (airdna_id) airdna_id, value, period
         FROM airdna_market_metrics WHERE metric = 'listing_count'
        ORDER BY airdna_id, period DESC`,
    ),
    pool.query(
      `SELECT airdna_market_id, count(*)::int AS n FROM airdna_listings GROUP BY 1`,
    ),
    pool.query(
      `SELECT airdna_id, count(DISTINCT period)::int AS m FROM airdna_market_metrics GROUP BY 1`,
    ),
    pool.query(`SELECT airdna_id, captured_at FROM airdna_markets`),
    pool.query(
      `SELECT coalesce(sa.parent_id, sa.id) AS market, count(*)::int AS n
         FROM listings l JOIN areas sa ON sa.id = l.area_id
        WHERE sa.id LIKE 'vn-%' GROUP BY 1`,
    ),
  ]);
  const activeBy = new Map(active.rows.map((r) => [r.airdna_id, r]));
  const uniBy = new Map(uni.rows.map((r) => [r.airdna_market_id, r.n]));
  const histBy = new Map(hist.rows.map((r) => [r.airdna_id, r.m]));
  const capBy = new Map(cap.rows.map((r) => [r.airdna_id, r.captured_at]));
  const oursBy = new Map(ours.rows.map((r) => [r.market, r.n]));

  const byArea = new Map<string, { name: string; keys: string[] }>();
  for (const r of xw.rows) {
    const e = byArea.get(r.area_id) ?? { name: r.name, keys: [] as string[] };
    e.keys.push(r.source_area_key);
    byArea.set(r.area_id, e);
  }
  const rows: TruthfulCoverageRow[] = [];
  for (const [areaId, { name, keys }] of byArea) {
    const withData = keys.map((k) => activeBy.get(k)).filter(Boolean);
    if (withData.length === 0) continue; // chưa thu dữ liệu AirDNA → không có dòng
    const activeTotal = withData.reduce((sum, r) => sum + Number(r.value), 0);
    rows.push({
      areaId,
      name,
      ourListings: oursBy.get(areaId) ?? 0,
      airdnaActive: activeTotal,
      airdnaPeriod: withData.reduce((m, r) => (r.period > m ? r.period : m), ""),
      airdnaUniverse: keys.reduce((sum, k) => sum + (uniBy.get(k) ?? 0), 0),
      historyMonths: keys.reduce((m, k) => Math.max(m, histBy.get(k) ?? 0), 0),
      capturedAt: keys.reduce<string | null>((m, k) => {
        const c = capBy.get(k);
        if (!c) return m;
        const iso = new Date(c).toISOString();
        return !m || iso > m ? iso : m;
      }, null),
      ratio: activeTotal > 0 ? (oursBy.get(areaId) ?? 0) / activeTotal : null,
      nMarkets: keys.length,
    });
  }
  return rows;
}

export type AirdnaMarketRow = {
  airdnaId: string;
  name: string;
  score: number | null;
  ourAreaId: string | null;
  ourListings: number | null;
};

/** Danh sách market AirDNA toàn quốc + crosswalk sang khu vực của ta (chỉ Ops). */
export async function getAirdnaMarkets(): Promise<AirdnaMarketRow[]> {
  const { rows } = await pool.query(
    `SELECT am.airdna_id, am.name,
            s.total AS score,
            -- Crosswalk qua area_sources (chính xác), fallback fuzzy
            COALESCE(
              (SELECT x.area_id FROM area_sources x
               WHERE x.source = 'S02' AND x.source_area_key = am.airdna_id
               LIMIT 1),
              (SELECT a.id FROM areas a
               WHERE a.country_code = 'vn' AND a.region_type = 'market'
                 AND (translate(lower(a.name), 'àáảãạăằắẳẵặèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộùúủũụưừứửữựỳýỷỹỵđ', 'aaaaaaaaaaaaaaaaaeeeeeeeeeeeiiiiioooooooooooouuuuuuuuuuuuyyyyyd')
                   = translate(lower(am.name), 'àáảãạăằắẳẵặèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộùúủũụưừứửữựỳýỷỹỵđ', 'aaaaaaaaaaaaaaaaaeeeeeeeeeeeiiiiioooooooooooouuuuuuuuuuuuyyyyyd')
                 )
               LIMIT 1)
            ) AS our_area_id,
            (SELECT mm.listing_count FROM market_metrics mm
             WHERE mm.area_id = COALESCE(
               (SELECT x.area_id FROM area_sources x
                WHERE x.source = 'S02' AND x.source_area_key = am.airdna_id LIMIT 1),
               (SELECT a.id FROM areas a WHERE a.country_code='vn' AND a.region_type='market'
                 AND translate(lower(a.name), 'àáảãạăằắẳẵặèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộùúủũụưừứửữựỳýỷỹỵđ', 'aaaaaaaaaaaaaaaaaeeeeeeeeeeeiiiiioooooooooooouuuuuuuuuuuuyyyyyd')
                   = translate(lower(am.name), 'àáảãạăằắẳẵặèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộùúủũụưừứửữựỳýỷỹỵđ', 'aaaaaaaaaaaaaaaaaeeeeeeeeeeeiiiiioooooooooooouuuuuuuuuuuuyyyyyd')
                 LIMIT 1))
             ORDER BY mm.month DESC LIMIT 1) AS our_listings
     FROM airdna_markets am
     LEFT JOIN airdna_scores s ON s.airdna_id = am.airdna_id
     ORDER BY s.total DESC NULLS LAST, am.name`,
  );
  return rows.map((r) => ({
    airdnaId: r.airdna_id,
    name: r.name,
    score: r.score === null ? null : Number(r.score),
    ourAreaId: r.our_area_id,
    ourListings: r.our_listings === null ? null : Number(r.our_listings),
  }));
}


export type AirdnaComparison = {
  marketScore: { total: number; seasonality: number; revenueGrowth: number; regulation: number; rentalDemand: number } | null;
  metrics: {
    metric: string;
    ourValue: number | null;
    ourUnit: string;
    airdnaValue: number | null;
    airdnaUnit: string;
    ratio: number | null; // our / airdna
  }[];
  submarketCount: number;
  capturedAt: string | null;
};

export async function getAirdnaComparison(areaId: string): Promise<AirdnaComparison | null> {
  // Crosswalk: areaId → airdna_id
  const { rows: xw } = await pool.query(
    `SELECT source_area_key FROM area_sources WHERE area_id = $1 AND source = 'S02' LIMIT 1`,
    [areaId],
  );
  const airdnaId = xw[0]?.source_area_key;
  if (!airdnaId) return null;

  const { rows: scores } = await pool.query(
    `SELECT * FROM airdna_scores WHERE airdna_id = $1`, [airdnaId],
  );
  const { rows: airdnaMetrics } = await pool.query(
    `SELECT metric, period, value FROM airdna_market_metrics
     WHERE airdna_id = $1 AND period = (SELECT max(period) FROM airdna_market_metrics WHERE airdna_id = $1 AND metric = 'adr')
     ORDER BY metric`, [airdnaId],
  );
  // Số tự thu gộp CẢ cửa sổ (có trọng số đêm), không lấy tháng cuối: dữ liệu là
  // lịch tương lai nên tháng xa nhất gần như chưa có booking.
  const { rows: ourMetrics } = await pool.query(
    `SELECT sum(revenue) / nullif(sum(booked_nights), 0) AS adr,
            sum(booked_nights)::numeric
              / nullif(sum(booked_nights) + sum(available_nights), 0) AS occupancy,
            max(listing_count) AS listing_count
     FROM market_metrics WHERE area_id = $1`, [areaId],
  );
  const { rows: subCount } = await pool.query(
    `SELECT count(*) n FROM airdna_submarket_metrics WHERE airdna_market_id = $1`, [airdnaId],
  );

  const ours = ourMetrics[0] ?? {};
  const byMetric = new Map(airdnaMetrics.map(m => [m.metric, Number(m.value)]));

  const metrics = [
    {
      metric: "ADR",
      ourValue: ours.adr !== null && ours.adr !== undefined ? Number(ours.adr) : null,
      ourUnit: "VND",
      airdnaValue: byMetric.get("adr") ?? null,
      airdnaUnit: "VND", // user đã đổi AirDNA sang VND — cùng đơn vị
      ratio: null as number | null,
    },
    {
      metric: "Occupancy",
      ourValue: ours.occupancy !== null && ours.occupancy !== undefined ? Number(ours.occupancy) : null,
      ourUnit: "%",
      airdnaValue: byMetric.get("occupancy") ?? null,
      airdnaUnit: "%",
      ratio: null as number | null,
    },
    {
      metric: "Listings",
      ourValue: ours.listing_count ? Number(ours.listing_count) : null,
      ourUnit: "",
      airdnaValue: byMetric.get("listing_count") ?? null,
      airdnaUnit: "",
      ratio: null as number | null,
    },
  ];
  for (const m of metrics) {
    const av = m.airdnaValue ?? 0;
    if (m.ourValue !== null && av > 0) {
      if (m.ourUnit === "%" && m.airdnaUnit === "%") {
        // occupancy: both as decimal (0-1) — normalize
        const o = m.ourValue > 1 ? m.ourValue / 100 : m.ourValue;
        const a = av > 1 ? av / 100 : av;
        m.ratio = a > 0 ? o / a : null;
      } else {
        m.ratio = m.ourValue / av; // same unit (VND or count) — direct
      }
    }
  }

  const score = scores[0];
  return {
    marketScore: score ? {
      total: Number(score.total),
      seasonality: Number(score.seasonality),
      revenueGrowth: Number(score.revenue_growth),
      regulation: Number(score.regulation),
      rentalDemand: Number(score.rental_demand),
    } : null,
    metrics,
    submarketCount: Number(subCount[0]?.n ?? 0),
    capturedAt: score?.captured_at?.toISOString?.() ?? null,
  };
}

/** Độ tươi dữ liệu thị trường cho footer Insight (DQO — ADR-0007). */
export async function getMarketFreshness(
  areaId: string,
): Promise<{ lastSnapshotAt: string | null; listingCount: number }> {
  const city = areaId.split("-").slice(0, 2).join("-").split("-")[1] ?? areaId;
  const { rows } = await pool.query(
    `WITH l AS (
       SELECT count(*)::int AS n FROM listings
       WHERE area_id = $1 OR area_id LIKE $1 || '-%'
     ), s AS (
       SELECT max(collected_at)::text AS last FROM airbnb_snapshots
       WHERE city = $2
         AND source IN (SELECT unnest(source_ids) FROM source_registry WHERE code = 'S01')
     )
     SELECT l.n, s.last FROM l, s`,
    [areaId, city],
  );
  return { lastSnapshotAt: rows[0]?.last ?? null, listingCount: rows[0]?.n ?? 0 };
}
