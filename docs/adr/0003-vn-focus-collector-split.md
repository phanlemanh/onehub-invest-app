# ADR-0003: Tập trung Việt Nam + tách repo thu thập dữ liệu

Ngày: 2026-10-17 · Trạng thái: accepted

## Bối cảnh

- One Invest chuyển hướng sản phẩm: thị trường mục tiêu là **Việt Nam và các
  thành phố lớn** (không phải global như AirDNA).
- Inside Airbnb đã bỏ Việt Nam khỏi coverage → nguồn dữ liệu chính phải là
  **thu thập trực tiếp từ Airbnb**; AirDNA chỉ dùng làm chuẩn đối chiếu
  (calibration/QA) — không đưa dữ liệu của họ vào sản phẩm.
- Dự án **cá nhân, phi thương mại**: mục đích là tự động hoá thay vì làm thủ
  công. Chủ sở hữu dự án tự quyết định chấp nhận rủi ro ToS của việc thu thập;
  vấn đề pháp lý không phải ràng buộc thiết kế (xem memory `oneinvest-scope`).
  Thiết kế vẫn giữ raw-zone + provenance vì **chất lượng dữ liệu** (re-parse khi
  logic transform đổi, audit nguồn), không phải vì pháp lý.
- Có thể dùng nhiều dịch vụ/phương pháp thu thập khác nhau → năng lực thu thập
  cần phát triển độc lập với sản phẩm.

## Quyết định

1. **Tách hoàn toàn repo `one-invest-collector`** chuyên thu thập. Lý do tách:
   lifecycle khác (scheduler dài hạn, retry/resume) + swap collector không chạm
   sản phẩm + tách bạch phần "năng lực cốt lõi" để đầu tư riêng.
2. **Hai repo ghép bằng data contract**, không ghép bằng code: collector ghi
   **raw snapshots bất biến** (theo nguồn, giữ payload nguyên vẹn) +
   **manifest** (`schemaVersion`, danh sách file + sha256, coverage telemetry).
   one-invest kéo manifest, verify checksum rồi mới parse/transform.
3. **Collector là plugin** (`collectors/*` implement một interface chung):
   thêm nguồn mới (airbnb-discovery, airbnb-listing, inside-airbnb, partner...)
   không đổi core hay sản phẩm.
4. **one-invest giữ vai trò transform + serving**, vẫn modular monolith
   (ADR-0001); pipeline mở rộng đọc manifest và chuẩn hoá đa nguồn về
   canonical listing model, gắn `snapshot_id` vào metrics.
5. Thu thập chỉ phạm vi **trang public, không đăng nhập, không giải
   CAPTCHA** — ranh giới kỹ thuật cố ý, giữ chi phí/độ phức tạp thu thập thấp.

## Hệ quả

- **Coverage telemetry là chỉ số cốt lõi**: mỗi snapshot phải trả lời "thấy
  được bao nhiêu % listings?" (đếm theo từng phương pháp discovery + độ giao
  nhau). Chỉ số này hiển thị trong sản phẩm.
- `snapshot_id` vào schema one-invest → mở đường cho supply growth và so sánh
  snapshot-vs-snapshot (đang thiếu từ M1′).
- Thứ tự đầu tư: (1) feasibility probe 1 quận Hà Nội bằng 2 phương pháp
  discovery, (2) collector skeleton chạy cron 1 city, (3) transform đa nguồn
  bên one-invest, (4) mở rộng city list theo coverage telemetry.
- Raw payload giữ theo retention policy + data minimization ở tầng transform
  (analytics không cần trường cá nhân).
