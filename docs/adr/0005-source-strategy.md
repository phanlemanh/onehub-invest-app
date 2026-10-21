# ADR-0005: AirDNA là nguồn dữ liệu hạng nhất — chiến lược "buy-now, own-later"

Ngày: 2026-10-18 · Trạng thái: accepted · Sửa bổ sung airdna-integration-plan.md

## Bối cảnh

Phân tích của user: AirDNA đáng được coi như một NGUỒN (như Airbnb, Zalo),
không chỉ lớp hiệu chỉnh — giá trị hiện tại của nó là "vừa dữ liệu, vừa hiệu
chuẩn", và vai trò nguồn giúp mở rộng sản phẩm ngay lập tức.

Đồng ý, vì 3 lý do:

1. **Cold-start toàn quốc**: tự thu của ta mới có 1 thành phố (Hà Nội) với
   vũ trụ 873 listings đang mở dần; AirDNA có sẵn toàn bộ market + submarket
   Việt Nam (LTM từ booking *thực*, cả Vrbo, lịch sử tới 120 tháng, future
   pacing) → sản phẩm có phủ националь ngay khi tài khoản active.
2. **Khác biệt phương pháp là tính năng, không phải lỗi**: số ta (forward-
   window, giá niêm yết) vs AirDNA (LTM, booking thực) — hiển thị song song
   + ratio thay vì chọn một.
3. **Mở rộng có định hướng**: `rank_markets` (MCP, sắp live) xếp hạng thị
   trường → chọn thành phố tự thu tiếp theo theo dữ liệu, không theo cảm tính.

Gốc rễ tư duy "chỉ hiệu chỉnh" từ thời chưa mua tài khoản — lỗi thời.

## Quyết định

1. **Chiều dữ liệu `source` ở tầng metrics**: `market_metrics` thêm cột
   `source` ('self' | 'airdna'). Rebuild SQL nhóm theo (area_id, month, source)
   — hai phương pháp song song, KHÔNG trộn số.
2. **View hợp nhất với chính sách ưu tiên**: `v_market_metrics` — mỗi
   (area, month, metric) lấy `self` nếu có, fallback `airdna`; UI đọc view
   → mọi trang hoạt động cho mọi thị trường ngay, và tự nâng cấp câm lặng
   khi dữ liệu tự thu của thành phố đó về tới.
3. **Crosswalk nguồn ↔ areas**: bảng `area_sources(area_id, source,
   source_area_key, meta)` map "Hà Nội" của AirDNA → `vn-hanoi`, submarket
   của họ → phường/quận của ta (fuzzy theo tên như OSM matching); mọi
   nguồn mới (Zalo以后) đăng ký ở đây.
4. **AirDNA ghi cả 2 vai trò vào cùng raw pipeline**: collector Track A/B
   capture đầy đủ (market metrics, submarket metrics, timeseries, scores,
   for-sale) — transform rẽ: số tổng hợp → market_metrics(source='airdna');
   điểm/chỉ số riêng → airdna_ref_scores (như kế hoạch cũ).
5. **Thứ tự mở rộng**: E1 rank toàn quốc + market-level metrics mọi tỉnh
   thành (bản đồ quốc gia) → E2 submarket chi tiết các thành phố trọng điểm
   → E3 tự thu từng thành phố theo xếp hạng (mỗi khi xong, source='self'
   chiếm chỗ trong view, AirDNA còn lại là cột đối chiếu) → E4 Zalo lớp
   giá bán/LT cho các focus city.

## Hệ quả

- Mô hình 3 nguồn thống nhất: mỗi nguồn = plugin collector + transform vào
  canonical + đăng ký crosswalk. "Nguồn" và "chuẩn" là VAI TRÒ theo-per-
  metric-per-city, không phải loại collector riêng.
- UI không đổi cấu trúc — chỉ thêm badge nguồn ("self-collected" /
  "AirDNA LTM" / "coalesced") cho trung thực.
- Giới hạn gói $249 (số submarket chi tiết) trở thành ràng buộc lập kế
  hoạch: market-level trước, submarket theo focus.
- Rủi ro phụ thuộc: nếu một ngày AirDNA tắt/hạn chế — view tự dùng self
  data; product không gãy.
