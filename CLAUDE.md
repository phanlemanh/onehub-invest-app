# app/ — Next.js Dashboard

## ⚠️ MANDATORY: Design Rules
**READ FIRST**: `DESIGN_RULES.md` — Quy trình bắt buộc chọn component:
ReUI block → shadcn/ui → custom (LAST RESORT). Lập inventory mọi component.

## Framework
- Next.js 16 App Router (force-dynamic on all pages)
- Tailwind CSS v4 + shadcn/ui + ReUI Pro ($250/yr, 654 blocks)
- Recharts via ReUI chart blocks (not bare Recharts)
- MapLibre GL for maps (requires setWorkerUrl from lib/map-worker.ts)

## Structure
```
app/src/
├── app/
│   ├── (marketing)/      # Invest Portal — trang chủ, /phuong-phap (navbar-12 + footer)
│   ├── (auth)/           # /login, /register — toàn màn hình (auth-4, auth-5)
│   ├── (app)/            # Invest Portal — /vn, /[country]/[market]/…, /listing, /saved, /login
│   ├── ops/              # Ops Portal — bắt buộc đăng nhập (proxy.ts + ops/layout.tsx)
│   └── actions.ts        # Server actions (login, logout, toggleSaved)
├── proxy.ts              # Next 16 "middleware": chặn sớm /ops khi thiếu cookie
├── components/
│   ├── shell/            # PortalShell (chuyển thể @reui/app-shell-30), nav.tsx, ⌘K, footer
│   ├── insight/          # Trang Insight (stats-1, chart-6, chart-13, data-grid chuyển thể)
│   ├── finder/           # Finder: bảng xếp hạng + ChoroplethMap (MapLibre) + bins
│   ├── listing/          # Chi tiết + Duyệt listing (heatmap form-5, thẻ product-grid-2, ListingsMap)
│   ├── page/             # PageHeader, StatTiles, tiers — dùng chung mọi trang
│   ├── yield/            # Form (form-11), độ tin cậy, pnl/ (chart-36 chuyển thể)
│   ├── marketing/ auth/ saved/ compare/  # P5: trang chủ, đăng nhập/ký, Đã lưu, So sánh
│   ├── states/           # Lỗi / 404 / skeleton chuẩn
│   ├── blocks/           # Block ReUI gốc (tham chiếu, không import trực tiếp)
│   ├── examples/         # c-* ReUI gốc (tham chiếu)
│   ├── reui/             # ReUI components (import trực tiếp, KHÔNG sửa)
│   ├── ui/               # shadcn base-nova (import trực tiếp, KHÔNG sửa)
│   └── *.tsx             # Component viết tay cũ — thay dần theo P1–P5
└── lib/                  # queries.ts, yield.ts, auth.ts, ops-access.ts, format.ts, map-worker.ts, map-style.ts, utils.ts
```

IA + lộ trình: `docs/architecture/invest-portal-ia.md`. Trang mới phải khai báo
cổng (`docs/architecture/portals.md`) và thêm mục vào `components/shell/nav.tsx`.

## ReUI Quick Reference
- Registry: `@reui` in `components.json`
- License: `REUI_LICENSE_KEY` in `.env.local` (NEVER commit)
- Install: `npx shadcn@latest add @reui/<block-name>`
- Import: `from "@/components/reui/<block-name>"`
- Full catalog: https://reui.io/blocks

## Key Files
- `lib/queries.ts` — ALL database queries (getKpis, getMetrics, getYieldRows, getAirdnaComparison...).
  Số liệu theo listing (đêm/đặt/doanh thu, công suất 90 đêm đầu) đọc `listing_stats` do
  `pipeline/sql/410_listing_stats.sql` tính sẵn — không gộp bảng nights (~11 triệu dòng) lúc tải trang.
- `lib/map-worker.ts` — MapLibre worker fix (setWorkerUrl from public/)
- `lib/map-style.ts` — bản đồ nền OpenFreeMap dùng chung (sáng/tối, nhãn tiếng Việt, ghi nguồn)

## Currency
- Map: `currencyFor(areaId)` → "THB" | "VND"
- Format: `fmtMoney(value, currency)` → "₫109,162" or "THB 2,179"

## Routes
- `/` — Trang chủ (marketing: navbar-12, hero-8, card-29, how-it-works-1, faq-6)
- `/phuong-phap` — Phương pháp & thuật ngữ
- `/login`, `/register` — nhóm `(auth)`, không shell; `?next=` đi qua `safeNext`
- `/saved` — Đã lưu; `/so-sanh?areas=a,b` — So sánh tối đa 4 khu vực
- `/vn`, `/th` — Finder (`/[country]`: bảng xếp hạng + bản đồ; `?level&market&metric&view`)
- `/vn/hanoi`, `/vn/hanoi/<phường>` — Insight thị trường / phường
- `/th/bangkok` — Bangkok (legacy, Inside Airbnb)
- `/listing/[id]` — Chi tiết listing (KPI so phường, lịch 365 đêm, comps gần nhất)
- `/vn/hanoi/listings` — Duyệt listing (`/[country]/[market]/listings`: thẻ + bản đồ nhãn giá)
- `/yield` — Ước tính lợi suất một căn (`?area&pn&m2&price&mgmt&platform&tax&fixed&setup`; mô hình ở `lib/yield.ts`)
- `/ops`, `/ops/design` — Ops Portal (đăng nhập; `OPS_EMAILS` tuỳ chọn để giới hạn)

## Don't
- **Don't create custom UI when ReUI block exists** (see DESIGN_RULES.md)
- Don't import from collector/ or pipeline/
- Don't use MapLibre without setWorkerUrl (blank map bug)
- Don't cache pages (force-dynamic required)
- Don't hardcode colors (use Tailwind CSS variables)
- Don't commit .env.local (contains REUI_LICENSE_KEY)
