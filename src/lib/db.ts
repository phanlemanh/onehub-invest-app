import { Pool } from "pg";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required");
}
const connectionString = process.env.DATABASE_URL;

// Remote (Supabase pooler qua Vercel): Node ≥20 coi sslmode=require là
// verify-full và từ chối chain của pooler — đặt ssl tường minh. Local thì
// giữ nguyên (không TLS).
const isLocal = /localhost|127\.0\.0\.1/.test(connectionString);

const pool = new Pool({
  connectionString,
  max: 5,
  ...(isLocal ? {} : { ssl: { rejectUnauthorized: false } }),
});

// C4 SPL: cloud lưu bảng trung tính ref_calib_* (không có tên nguồn tầng A
// trong DB chia sẻ). App SQL viết theo tên local (airdna_*) — rewriter ở
// ĐÚNG MỘT ĐIỂM này đổi tên BẢNG trước khi thực thi. Danh sách bảng đủ
// cụ thể để không đụng cột trùng tiền tố (airdna_id, airdna_sub_id…).
// C4 SPL: cloud lưu bảng trung tính ref_calib_* (không có tên nguồn tầng A
// trong DB chia sẻ). App SQL viết theo tên local (airdna_*) — patch ĐÚNG MỘT
// ĐIỂM pool.query để rewrite tên BẢNG trước khi thực thi. Danh sách bảng đủ
// cụ thể để không đụng cột trùng tiền tố (airdna_id, airdna_sub_id…).
if (process.env.RENAME_REFCALIB === "1") {
  const CLOUD_TABLE_MAP =
    /\bairdna_(markets|scores|market_metrics|sub_monthly|future_daily|listings|submarket_metrics)\b/g;
  const origQuery = pool.query.bind(pool);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (pool as any).query = (text: string, values?: any[]) =>
    origQuery(text.replace(CLOUD_TABLE_MAP, "ref_calib_$1"), values);
}

export { pool };
