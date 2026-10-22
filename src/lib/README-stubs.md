# Overlay sanitise (ADR monorepo)

Khi sync app → onehub-invest-app, mọi file nhạy cảm đặt BẢN STUB tại
`tools/public-overlay/app/...` (đường dẫn tương ứng). Danh sách đã sanitise
lần 065ee2f (chuẩn đối chiếu):
- src/lib/zalo-admin.ts (multi-account thật)
- src/lib/collections-queries.ts (flow thật)
- src/lib/ops-queries.ts (queries thật — bản public là stub)
- src/app/api/zalo-* routes (6 routes)
Overlay hiện TRỐNG vì repo public đã có stub từ 065ee2f — chỉ cần thêm khi
file mới nhạy cảm xuất hiện.
