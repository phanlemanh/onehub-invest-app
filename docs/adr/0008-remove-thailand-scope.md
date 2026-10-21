# ADR-0008: Rút scope về Việt Nam — xoá toàn bộ dữ liệu & code Thailand/Bangkok

Ngày: 2026-10-20 · Trạng thái: accepted

## Bối cảnh

Bangkok/Thailand là dữ liệu thừa hưởng từ M1–M5 (Inside Airbnb snapshot
2026-09-22) khi sản phẩm còn hướng global theo AirDNA. Từ ADR-0003 sản phẩm
tập trung Việt Nam; `portals.md` luật 8 đã đánh dấu `/th/**` là legacy
"quyết định xoá bằng ADR riêng". User quyết định xoá (2026-10-20).

Phạm vi dữ liệu Bangkok chiếm áp đảo: 30.922/31.403 listings, phần lớn
11,4M dòng nights, 51 areas — làm nhiễu metrics vận hành, backup nặng, và
không thuộc sản phẩm.

## Quyết định

1. **Xoá toàn bộ dữ liệu th/%** khỏi DB: listings + nights (cascade),
   market_metrics/area_breakdowns/market_asset_stats/areas th,
   saved_markets 'th-bangkok' (demo M5), listing_stats (cascade theo
   listings).
2. **Xoá code hỗ trợ th**: chấp nhận country 'th' trong UI (finder, breadcrumb,
   currencyFor THB) — route `/[country]` động tự 404 khi hết dữ liệu; dọn
   các reference tĩnh.
3. **Scope sản phẩm = Việt Nam** (khớp ADR-0003). Mở rộng quốc gia khác =
   ADR mới khi có nhu cầu thật.
4. **Backup toàn DB trước khi xoá**:
   `~/dev/one-invest-backups/pre-th-removal-20260120-0613.sql.gz` (119MB,
   gzip verified) — khôi phục được toàn bộ nếu cần.

## Hệ quả

- DB nhỏ đi ~95% dung lượng nights/listings; metric vận hành sạch (chỉ VN).
- Trang demo Bangkok / số liệu M5 không còn; `/saved` mất mục demo Bangkok.
- Quy tắc mới: thêm nguồn dữ liệu phải gắn scope quốc gia rõ ràng trong
  collector config.
