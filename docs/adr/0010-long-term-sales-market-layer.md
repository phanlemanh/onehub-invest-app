# ADR-0010: Lớp thị trường cho thuê dài hạn & mua bán (full investment picture)

Ngày: 2026-10-20 · Trạng thái: proposed · Liên quan: ADR-0002 (Market Insights
core), ADR-0004 (multi-market), ADR-0007 (SPL/DQO), ADR-0009 (ranh giới RE);
điều tra nền `docs/research/biggerpockets-markets-architecture.md`; spec chi
tiết `docs/research/invest-portal-full-picture-spec.md`

## Bối cảnh

Data Zalo (S03: `sale_offers` kind `sale`|`rent_lt`) đang chảy nhưng chưa có
hướng xử lý thành sản phẩm. Invest Portal hiện chỉ trả lời câu hỏi STR (ADR,
Occupancy, RevPAR — lớp AirDNA S02). Nhà đầu tư BĐS VN cần cả 3 lớp trong một
bức tranh: **mua bán** (giá & tăng trưởng), **cho thuê dài hạn** (dòng tiền
ổn định), **STR** (dòng tiền cao, mùa vụ). BiggerPockets Markets (điều tra
REA 2026-10-20) kiểm chứng bộ 5 trục chỉ số tối giản cho LTR+mua bán:
giá/tăng trưởng, thuê/tăng trưởng thuê, tỉ lệ thuê/giá, sức hút thị trường,
chi trả.

## Quyết định

1. **Mô hình 3 lớp tài sản trên cùng một market** (`area` hiện có: market =
   tỉnh/thành, submarket = quận/phường). Market Insight mở rộng thành 3
   khối: Mua bán · Cho thuê dài hạn · STR — không tách app/route mới
   (`portals.md`: Invest Portal giữ pattern `/vn/[market]`).
2. **`market_asset_stats` thành time-series theo tuần**: thêm cột
   `as_of date` vào PK `(area_id, kind, as_of)` qua migration mới (không sửa
   production tay — quy tắc 3). Rollup chạy trong pipeline/ sau transform,
   idempotent theo tuần; một job DQ gate khối lượng + phân phối như 450_dq.
3. **Đơn vị giá Việt Nam**: chỉ số gốc là **giá/m²** (`price_perm2`) cho
   sale; rent tính VND/tháng (tách theo bedrooms khi đủ mẫu). Không dịch
   nguyên văn metric Mỹ (RTP tháng %, affordability income-to-price) — dùng
   tương đương VN định nghĩa trong
   `docs/research/invest-portal-full-picture-spec.md` (gross yield LTR
   năm %, GRM).
4. **Yield là chỉ số cầu nối**: trang `/yield` (G1) nâng cấp thành so sánh
   3 lớp cùng market: gross yield LTR vs STR (RevPAR×365/giá) vs tăng trưởng
   giá — công thức thống nhất theo `metric-definitions.md` (mở rộng thêm mục
   LTR/mua bán).
5. **Data Confidence hiển thị công khai** (đã có: confidence per offer,
   truthful-coverage E2-C2D): mọi khối số liệu market kèm n mẫu + badge độ
   tin cậy + "Cập nhật: <tuần>". Không tái tạo Community Score A–F của BP
   (không có nguồn VN) — ghi divergence list trong spec.
6. **Serving chỉ đọc tổng hợp** (quy tắc 4): React đọc từ bảng rollup/API
   v1, mọi tính toán median/percentile trong pipeline — mirror kiến trúc
   hiện tại và BP (SSR + JSON tĩnh).
7. **Không dùng dữ liệu AirDNA cho lớp LTR/mua bán**; BP chỉ là tham chiếu
   nguyên lý (đã ghi ledger trong doc điều tra), số liệu 100% từ S03 tự thu
   (+ GSO/Census cho demographics khi thêm).

## Hệ quả

- Migration mới (PK `market_asset_stats` + snapshot tuần) + transform-zalo
  mở rollup toàn quốc (hiện chỉ HN) — chi tiết phase L1 trong spec.
- Finder (`/vn`) thêm sort/filter theo yield/giá-m²/khối lượng; Insight
  thêm 2 khối; API `/api/v1/markets/**` phục vụ map choropleth theo tỉnh.
- Nguồn Facebook (đã chuẩn bị) nạp vào cùng parser `parsePost` — không
  branch schema mới; source_registry gán S03.
- Sáp nhập tỉnh 2025 đã có ALIAS crosswalk (E2) — rollup dùng đúng cây
  63 tỉnh mới.
