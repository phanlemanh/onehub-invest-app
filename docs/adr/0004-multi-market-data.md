# ADR-0004: Mở rộng đa nguồn dữ liệu BĐS (Zalo groups) — giữ 2 repo, mở mô hình dữ liệu đa tài sản

Ngày: 2026-10-18 · Trạng thái: accepted

## Bối cảnh

- One Invest hiện có: dữ liệu cho thuê ngắn hạn (STR) tự thu từ Airbnb
  (discovery + listing + calendar) + ranh giới OSM + (đang tích hợp) AirDNA
  làm chuẩn hiệu chuẩn.
- Ý định mới: thu thập tin rao **bán** và **cho thuê dài hạn (LT)** từ các
  nhóm Zalo môi giới — giá bán, giá thuê dài hạn theo thị trường.
- Ba loại dữ liệu có tính chất rất khác nhau: Airbnb = API có cấu trúc;
  AirDNA = chuẩn tham chiếu; **Zalo = văn bản tự do tiếng Việt** (thiếu cấu
  trúc, repost trùng lặp, vị trí mờ, chứa dữ liệu cá nhân SĐT).

## Quyết định

1. **Chiến lược repo: KHÔNG tách thêm repo.** Thu thập Zalo là một plugin
   collector nữa (`zalo-groups`) — đúng contract hiện có (raw immutable +
   manifest + checkpoint). Toàn bộ suy diễn (parse tiếng Việt, geocode, dedup)
   thuộc tầng transform của one-invest (`transform-zalo.mjs`) — giữ nguyên
   nguyên tắc "collector không chuẩn hoá".
   - Trigger tách repo thứ 3 (enrichment service) chỉ khi: extraction chạy
     batch LLM lớn tách nhịp release riêng, hoặc nhiều người cùng phát triển.
     Chưa tới lúc.
2. **Mô hình dữ liệu đa tài sản**: bên cạnh `listings/nights` (STR) thêm
   `sale_offers` (tin bán) và `rent_lt_offers` (tin thuê dài hạn) — mỗi offer
   giữ provenance (post refs, nhóm, timestamps) + dedup_key + confidence.
3. **Luồng ingest Zalo là pull-có-checkpoint** (poll nhóm theo timestamp tin
   cuối — checkpoint core đã có), KHÔNG phải push listener → không đổi kiến
   trúc scheduler.
4. **Kỷ luật an toàn tài khoản Zalo**: chỉ ĐỌC (không bao giờ gửi tin), poll
   chậm (1-2 lần/ngày), session riêng.
5. **Data minimization ở transform**: analytics không cần SĐT — giữ ở staging
   (raw), strip khi lên canonical offers; raw theo retention policy.

## Hệ quả

- Bảng mới: `stg_zalo_posts` (raw), `sale_offers`, `rent_lt_offers`,
  `market_asset_stats` (median giá bán/m², giá thuê LT, **yield** theo
  area × tháng).
- **Yield = tính năng sản phẩm cốt lõi mới**: STR yield = doanh thu Airbnb
  12-tháng của ta ÷ giá bán median; LT yield = thuê LT × 12 ÷ giá bán —
  trả lời trực tiếp câu hỏi nhà đầu tư.
- AirDNA MCP có sẵn `get_for_sale_listings/get_for_sale_metrics` (MLS + dự
  phóng STR yield) → nguồn hiệu chuẩn cho giá bán từ Zalo, đối xứng với vai
  trò hiệu chuẩn STR của AirDNA hôm nay.
- Parser tiếng Việt (regex quy tắc, đo coverage) là rủi ro kỹ thuật chính;
  thiết kế sao cho thay bằng LLM-assist sau này không đổi interface transform.
