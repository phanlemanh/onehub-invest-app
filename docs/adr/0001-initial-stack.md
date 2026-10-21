# ADR-0001: Stack khởi đầu và cấu trúc repo

Ngày: 2026-10-16 · Trạng thái: accepted

## Bối cảnh

Market Finder là tính năng đầu tiên của **One Invest** — công cụ đầu tư BĐS
cho thuê ngắn hạn.
Đã điều tra AirDNA bằng REA (xem `docs/research/`) để học kiến trúc tham chiếu.

## Quyết định

1. **App**: Next.js (App Router, TypeScript) + Tailwind; state server qua
   TanStack Query; biểu đồ Recharts; bản đồ **MapLibre GL**.
2. **DB**: Postgres + PostGIS. Metrics precompute theo tháng trong pipeline,
   client chỉ đọc (mirror kiến trúc AirDNA đã quan sát).
3. **Repo đơn**, không monorepo: `src/` app, `pipeline/` ETL, `db/` migrations.
4. **MapLibre thay deck.gl**: MVP chỉ cần choropleth + vài nghìn polygon
   (county/city level); deck.gl chỉ cân nhắc lại khi cần renderer GPU
   cho hàng chục nghìn polygon động.
5. Dữ liệu chỉ từ nguồn công khai (Inside Airbnb, Census, Natural Earth);
   không scrape AirDNA (ToS). Tham khảo AirDNA giới hạn ở kiến trúc/UX.

## Hệ quả

- Scaffold bằng create-next-app trong `src/` (xem AGENTS.md).
- Chuyển sang Turborepo chỉ khi có ≥2 app thật sự (web + worker riêng).
- `research-local/` + `*.har` gitignored vĩnh viễn (chứa token session).
