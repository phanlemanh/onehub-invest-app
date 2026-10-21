# ADR-0002: Market Insights là tính năng lõi

Ngày: 2026-10-16 · Trạng thái: accepted

## Bối cảnh

Ban đầu định làm Market Finder (map) trước. Sau khi có đủ bằng chứng điều tra,
user chốt: trang chi tiết thị trường (Market Insights) mới là nơi ra quyết định
đầu tư — map chỉ là lớp discovery. Nghiên cứu hiện có cũng nghiêng về phía
insights: blueprint 9 section + danh mục ~40 endpoint metric từ trước, hợp đồng
API trang insights vừa đóng nốt (2026-10-16, xem `market-insights-spec.md`).

## Quyết định

1. **Market Insights = tính năng lõi**, xây trước theo milestone M1′–M3′
   (nền tảng → trang lõi → sections sâu). Market Finder dời xuống M4′ làm
   lớp discovery trên cùng nền API/dữ liệu.
2. Nền tảng dùng chung không đổi (ADR-0001): PostGIS + metrics precompute
   tháng + hierarchy market/submarket — phục vụ cả hai tính năng.
3. Xây trang insights theo **vertical slice từng section** (kiểm soát scope,
   tránh sa lầy vì trang rộng hơn map).
4. Paywall mirror cơ chế AirDNA đã quan sát: envelope `{payload,status}` +
   `redactions[]` field-level từ đầu, kể cả khi chưa có gói trả phí.

## Hệ quả

- Mini-map trong header dùng MapLibre + polygon từ DB (không cần Google Maps).
- Timeseries 36 tháng granularity monthly là chuẩn lưu trữ (`metrics` table
  keyed theo area×month).
- Schema response timeseries thật của AirDNA chưa quan sát được (tài khoản
  khóa submarket) — unknown được ghi nhận, không chặn M1′–M2′.
