# DESIGN RULES — Bắt buộc cho mọi AI Coding Agent

> **NGUYÊN TẮC VÀNG**: ReUI block tồn tại? → DÙNG NÓ. Không tồn tại? → shadcn/ui
> base. Cả hai không có? → THEN tạo mới (theo ReUI patterns).

## Quy trình chọn component (THEO THỨ TỰ, KHÔNG BỎ BƯỚC)

```
┌─────────────────────────────────────────────┐
│  Cần UI element mới                         │
└─────────────────┬───────────────────────────┘
                  ▼
┌─────────────────────────────────────────────┐
│  B1: ReUI block có sẵn không?              │
│  → Check danh sách blocks bên dưới          │
│  → Check https://reui.io/blocks             │
│                                              │
│  CÓ → npx shadcn@latest add @reui/<name>   │
│       → Customize props/colors/data         │
│       → DONE ✅                             │
└─────────────────┬───────────────────────────┘
                  │ KHÔNG
                  ▼
┌─────────────────────────────────────────────┐
│  B2: shadcn/ui base component?             │
│  → button, card, dialog, dropdown, etc.    │
│  → npx shadcn@latest add <name>            │
│                                              │
│  CÓ → Install + compose                    │
│       → DONE ✅                             │
└─────────────────┬───────────────────────────┘
                  │ KHÔNG
                  ▼
┌─────────────────────────────────────────────┐
│  B3: Tạo mới (LAST RESORT)                 │
│  → Follow ReUI patterns (see below)         │
│  → Add to this inventory                   │
│  → Note WHY no ReUI block was suitable     │
└─────────────────────────────────────────────┘
```

## REUI BLOCKS — Danh sách available (2004 items, tên ĐÃ XÁC MINH 2026-10)

> **QUAN TRỌNG — CÁCH TÌM BLOCK ĐÚNG:**
> ```bash
> # Liệt kê 100 item đầu (có paging)
> npx shadcn@latest search @reui
> npx shadcn@latest search @reui --offset 100   # trang 2, 3...
>
> # Lọc theo nhu cầu (grep từ khóa)
> npx shadcn@latest search @reui --offset 200 | grep -E "c-chart|c-data-grid"
> ```
> **Quy ước tên**: `c-<component>-N` = demo 1 pattern (charts, cards, grids...),
> `<category>-N` = trang hoàn chỉnh (app-shell, auth, blog...), tên trần = UI primitive.

### Charts (`c-chart-1` → `c-chart-25`, 25 blocks) — DÙNG THAY VÌ custom Recharts

| Nhu cầu | Block | Mô tả |
|---------|-------|-------|
| Timeseries area (revenue, ADR, occupancy) | `@reui/c-chart-16` | Area chart with glowing dot markers |
| Timeseries + forecast | `@reui/c-chart-17` | Forecast line with stripe pattern zone |
| Gradient area | `@reui/c-chart-13` | Gradient area with stripe overlay |
| Stacked area | `@reui/c-chart-14` | Stacked area, dashed strokes |
| Bar (ADR by size, room type) | `@reui/c-chart-2` | Multi-dataset bar chart |
| Bar gradient | `@reui/c-chart-7` | Gradient bar chart |
| Donut (revenue split) | `@reui/c-chart-19` | Donut chart with center total |
| Donut + stats | `@reui/c-chart-20` | Donut with center stats |
| Pie | `@reui/c-chart-21` | Pie with stripe patterns |
| Radar | `@reui/c-chart-23` | Radar with gradient fill |
| Radial gauge (Market Score) | `@reui/c-chart-25` | Lighthouse radial with labels |

### Stats & Cards (`c-card-*`) — DÙNG THAY VÌ custom KPI cards

| Nhu cầu | Block | Mô tả |
|---------|-------|-------|
| KPI card + trend + menu | `@reui/c-card-15` | Stat card with trend and overflow menu |
| Expandable usage card | `@reui/c-card-13` | Expandable billing usage card |
| Status summary | `@reui/c-card-14` | Deployment status summary card |
| Card + actions | `@reui/c-card-16` | Card with header badge and actions |

### Data Grids (`c-data-grid-1` → `c-data-grid-34`, 34 blocks) — DÙNG THAY VÌ custom tables

| Nhu cầu | Block | Mô tả |
|---------|-------|-------|
| Table phường sortable | `@reui/c-data-grid-11` | Sortable columns |
| Phân trang | `@reui/c-data-grid-1` | Pagination |
| Search + filter | `@reui/c-data-grid-34` | Server-side pagination, sorting, search, filter |
| Row selection | `@reui/c-data-grid-7` | Row selection |
| Expandable rows | `@reui/c-data-grid-8` | Expandable rows |
| Summary footer | `@reui/c-data-grid-25` | Summary stats footer |
| Infinite scroll | `@reui/c-data-grid-27` | Local infinite scroll |
| Virtual hóa (data lớn) | `@reui/c-data-grid-32` | Column virtualization |

### Layout / App Shell (`app-shell-1` → `app-shell-27+`)

| Nhu cầu | Block | Mô tả |
|---------|-------|-------|
| Dashboard + sidebar | `@reui/app-shell-1` | Icon-collapsible sidebar + workspace switcher |
| SOC/analytics console | `@reui/app-shell-26` | Top bar + section pills + Cmd+K |

### Auth (`auth-1` → `auth-20`)

| Nhu cầu | Block |
|---------|-------|
| Login email+password | `@reui/auth-1` |
| Magic link | `@reui/auth-3` |
| Đăng ký | `@reui/auth-5` |

### AI & Agents (Agent Swarm UI tương lai)

| Nhu cầu | Block | Mô tả |
|---------|-------|-------|
| Agent activity feed | `@reui/agent-activity-2` | Narrates an agent run |
| Agent task wrap-up | `@reui/agent-activity-5` | Finished task card |
| AI spend monitor | `@reui/ai-usage-1` | Token usage ruler |

### Cards khác

| Nhu cầu | Sử dụng |
|---------|----------|
| List card | `@reui/c-card-*` series |
| Timeline | `@reui/c-accordion-11` (onboarding steps) |

## REUI PATTERNS — Khi tạo component mới

Nếu BƯỚC B3 (tạo mới), PHẢI follow các patterns sau:

### 1. File structure
```
src/components/custom/
└── <component-name>.tsx
```

### 2. Import pattern
```tsx
"use client";  // Nếu có interactivity
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
```

### 3. Styling pattern (Tailwind utility classes ONLY)
```tsx
// ✅ ĐÚNG — Tailwind utilities
<div className="rounded-lg border border-neutral-200 bg-white p-4">

// ❌ SAI — custom CSS
<div style={{ borderRadius: '8px', border: '1px solid #e5e5e5' }}>
```

### 4. Color tokens (CSS variables, không hardcode)
```tsx
// ✅ ĐÚNG — semantic tokens
<div className="bg-primary text-primary-foreground">

// ❌ SAI — hardcoded hex
<div className="bg-[#2563eb] text-white">
```

### 5. Component size pattern
```tsx
// Prefer composition over monolith
<Card>
  <CardHeader>...</CardHeader>
  <CardContent>...</CardContent>
</Card>

// ❌ Không tạo 1 giant component chứa tất cả
```

## ⚠️ BASE-NOVA — BẪY LỚN NHẤT (đã gặp 2026-10)

ReUI ship **2 biến thể** cho mọi item: **Base UI** và **Radix UI**, chọn qua
`{style}` trong URL registry. Project này dùng **`base-nova`** (Base UI).

- ✅ `components.json` → `"style": "base-nova"` → primitives import từ `@base-ui/react/*`
- ❌ `"style": "new-york"` → Radix → block ReUI báo lỗi TS `Property 'render' does not exist`
  (block dùng prop `render`/`indeterminate`/`alignItemWithTrigger` — chỉ Base UI có)

**Nếu gặp TS errors như trên → kiểm tra `"style"` trong `components.json` trước khi sửa code.**

## CẤU TRÚC SAU INSTALL

```
src/components/
├── examples/          # Block demo (c-chart-16.tsx, c-card-15.tsx...)
│                      # → COPY pattern từ đây vào feature component
├── reui/              # Component tái sử dụng (reui/data-grid/*, reui/badge...)
│                      # → IMPORT TRỰC TIẾP trong app code
└── ui/                # Primitives Base UI (button, card, dropdown-menu...)
                       # → IMPORT TRỰC TIẾP, KHÔNG SỬA
```

`npm run lint` bỏ qua `reui/**` và `blocks/**` (code vendor, không sửa — eslint.config.mjs):
lint phải 0 lỗi trên code của mình. Chuyển thể block sang thư mục feature thì lint áp dụng.

## COMPONENT INVENTORY — Đã cài + tự tạo

### ReUI Blocks (installed 2026-10-17)
| Block | File | Dùng cho | Ghi chú |
|-------|------|----------|---------|
| `@reui/c-chart-16` | examples/c-chart-16.tsx | Timeseries revenue/ADR/occupancy | Area + glowing dots |
| `@reui/c-chart-2` | examples/c-chart-2.tsx | Bar so sánh city/room-type | Multi-dataset |
| `@reui/c-chart-19` | examples/c-chart-19.tsx | Donut phân bổ revenue | Center total |
| `@reui/c-card-15` | examples/c-card-15.tsx | KPI card + trend | Có overflow menu |
| `@reui/c-data-grid-11` | examples/c-data-grid-11.tsx | Bảng phường sortable | + reui/data-grid/* engine |
| `@reui/app-shell-30` | blocks/app-shell-30/ (bản gốc, tham chiếu) → **components/shell/** (bản dùng) | Shell mọi cổng: top bar, nav, ⌘K, account | Cài 2026-10-18 (P0). Nav khai báo ở `shell/nav.tsx` |
| `@reui/c-command-5` | examples/c-command-5.tsx → shell/search-command.tsx | ⌘K tìm tỉnh/phường | cmdk, tìm không dấu qua `keywords` |
| `@reui/c-alert-1` | examples/c-alert-1.tsx → states/page-error.tsx | Trạng thái lỗi + Thử lại | `error.tsx` |
| `@reui/c-empty-3` | examples/c-empty-3.tsx → states/not-found-state.tsx | 404 | `not-found.tsx` |
| `@reui/stats-1` | blocks/stats-1/ → insight/insight-stats.tsx | KPI Insight | Bỏ menu "…"; badge = vị trí so với phường anh em (p30/p60/p90) thay cho % tháng trước |
| `@reui/chart-6` | blocks/chart-6/ → insight/performance/ | Hiệu suất theo tháng (4 ô chuyển 1 đường) | Theo THÁNG, dữ liệu qua props, bỏ lớp "kỳ trước" (lịch tương lai), mốc = Tết/30-4/Hè/2-9 |
| `@reui/chart-13` | blocks/chart-13/ → insight/revenue-mix/ | Cơ cấu doanh thu theo loại phòng | Một cửa sổ (bỏ đổi kỳ); cột "thay đổi" → số listing |
| `@reui/frame`, `@reui/icon-tile`, `breadcrumb`, `sonner` | reui/, ui/ | Khung panel, breadcrumb, toast | `Toaster` gắn trong providers.tsx |
| `@reui/data-grid-base-2` | blocks/data-grid-base-2/ → finder/finder-cells.tsx | Finder: thanh chỉ số (ScoreCell) + sparkline lịch đặt | Thanh tô theo bậc p30/p60/p90 (cùng màu bản đồ); sparkline một màu trung tính vì lịch tương lai luôn thưa dần |
| `@reui/form-5` | blocks/form-5/ → listing/booking-heatmap.tsx | Lịch đặt 365 đêm của listing | Lấy riêng activity heatmap: cột = tuần (T2→CN), 3 trạng thái thay 4 mức cường độ; tooltip từng đêm |
| `@reui/product-grid-2` | blocks/product-grid-2/ → listing/listing-card.tsx | Thẻ listing ở trang Duyệt listing | Bỏ panel ảnh (chưa thu ảnh, không dùng ảnh giả); swatch/giá → badge loại phòng + 3 chỉ số |
| `@reui/form-11` | blocks/form-11/ → yield/yield-form.tsx | Form ước tính lợi suất + dải tóm tắt trực tiếp | Đặt trong Frame (trang họ Frame); `noValidate` vì bước ±0,1 tỷ chỉ là bước của nút |
| `@reui/chart-36` | blocks/chart-36/ → yield/pnl/ | Doanh thu vs chi phí 12 tháng + biên lợi nhuận | Dữ liệu qua props, mốc = biên để ngang thuê dài hạn (ẩn khi > 100%), làn biên tối thiểu 20 điểm %, bước trục theo bậc độ lớn |
| `@reui/number-field` | reui/number-field.tsx | Ô nhập số (PN, m², giá, chi phí) | `id` của NumberField là id của ô nhập |
| `@reui/auth-4` | blocks/auth-4/ → auth/login-form.tsx | Đăng nhập | Bỏ đăng nhập mạng xã hội + "Quên mật khẩu" (chưa có); nối server action; nền noise ở (auth)/layout |
| `@reui/auth-5` | blocks/auth-5/ → auth/register-form.tsx | Đăng ký | Bỏ dải logo khách hàng (không có thật); hero viết cho nhà đầu tư, số đếm thật |
| `@reui/wishlist-2` | blocks/wishlist-2/ → saved/ | Đã lưu | Tín hiệu giá → loại khu vực; ảnh → panel số RevPAR; ✕ = bỏ lưu thật; "Add all" → So sánh |
| `@reui/comparison-1` | blocks/comparison-1/ → compare/ | So sánh tối đa 4 khu vực | Cột trên URL; ô tốt nhất mỗi hàng tô xanh; thêm cột bằng hộp c-command-5. Hằng số ở compare-types.ts (module thường) |
| `@reui/navbar-12` | blocks/navbar-12/ → marketing/marketing-navbar.tsx | Thanh điều hướng trang chủ/Phương pháp | Thêm ⌘K + tài khoản + menu ☰ cho màn hẹp (bản gốc không có) |
| `@reui/hero-8` | blocks/hero-8/ → marketing/hero.tsx | Hero trang chủ | Ô email → ô tìm khu vực; "console" giả → bản xem trước số thật |
| `@reui/card-29` | blocks/card-29/ → marketing/market-cards.tsx | Thị trường đang theo dõi | Dải diện tích vẽ từ doanh thu theo tháng thật (bản gốc là hình cố định) |
| `@reui/how-it-works-1` | blocks/how-it-works-1/ → marketing/how-it-works.tsx | 3 bước dùng sản phẩm | Card → Frame (trang chủ họ Frame) |
| `@reui/faq-6` | blocks/faq-6/ → marketing/faq-section.tsx | Hỏi đáp trang chủ + định nghĩa trang Phương pháp | Dữ liệu qua props |

### shadcn/ui Base (installed)
| Component | File | Note |
|-----------|------|------|
| Card | components/ui/card.tsx | Wrapper cho metrics |
| Button | components/ui/button.tsx | Actions |
| cn() | lib/utils.ts | Tailwind merge utility |

### Bản đồ nền (mọi bản đồ MapLibre)
- Dùng `lib/map-style.ts`: `basemapUrl("colored" | "muted", dark)` + `MAP_OPTIONS` + `addAttribution` + `prepareBasemap`. Nguồn OpenFreeMap (OSM, không khoá, không giới hạn lượt).
- `colored` (Liberty) cho bản đồ cần định vị (nhãn giá listing); `muted` (Positron) cho bản đồ mà màu là dữ liệu (choropleth). Chế độ tối dùng `dark` cho cả hai.
- Lớp dữ liệu dạng vùng chèn trước id mà `prepareBasemap` trả về, để tên đường nằm trên. Marker/nhãn thì thêm sau cùng.
- Dựng lớp riêng trong `map.on("style.load")`, đổi sáng/tối bằng `setStyle(url, { diff: false })` — không dựng lại bản đồ, giữ khung nhìn.
- Màu trong MapLibre phải là hex; màu "chưa có số" đổi theo sáng/tối (`NO_DATA_COLOR` / `NO_DATA_COLOR_DARK`).
- Popup: `setDOMContent` + `textContent`, không `setHTML` với tên lấy từ DB.

### Custom Components (created — LAST RESORT only)
| Component | File | Why not ReUI? |
|-----------|------|---------------|
| MiniMap | components/mini-map.tsx | ReUI không có MapLibre blocks. Nền xám nhạt (lib/map-style.ts), phường đang xem tô đậm |
| ChoroplethMap | components/finder/choropleth-map.tsx | MapLibre thuần (chỉ vẽ + popup + bấm); bộ chọn chỉ số và chú giải là ReUI bên ngoài. Màu bậc chung ở finder/bins.ts. Nền xám nhạt, lớp màu chèn DƯỚI lớp nhãn của nền |
| PageHeader / StatTiles | components/page/ | Không phải component mới: page-header của app-shell-30 và stats-1 gom lại để Insight, Listing, Duyệt listing dùng chung (`actions` slot; `tierOf` ở page/tiers.ts để trang server gọi được) |
| ListingsMap | components/listing/listings-map.tsx | MapLibre, nền có màu; nhãn giá kiểu Airbnb vẽ bằng lớp symbol (ảnh viên thuốc co giãn), gom cụm tới zoom 11, nhãn đè nhau tự ẩn còn chấm; chỉ lọc danh sách theo khung nhìn khi có cử chỉ thật (dragstart/zoomstart có originalEvent, hoặc bấm cụm) |
| InsightGrid | components/insight/insight-grid.tsx | Không phải component mới: Frame + DataGrid theo đúng mẫu c-data-grid-11, gom lại để 6 bảng dùng chung nhãn tiếng Việt (`DATA_GRID_VI`) |
| InsightNav | components/insight/insight-nav.tsx | Style view track của app-shell-30; tự theo dõi cuộn vì `@reui/scrollspy` với target document bám vào `scroll-area-viewport` đầu tiên trong trang (vùng cuộn DataGrid) và luôn báo nhầm mục cuối |
| SiteFooter | components/shell/site-footer.tsx | ReUI không có block footer |
| PageSkeleton | components/states/page-skeleton.tsx | Ghép từ `ui/skeleton` theo bố cục Insight; dùng trong `<Suspense>`, KHÔNG làm `loading.tsx` cấp segment (mất mã 404/307) |

## BẪY "use client" (đã gặp 2 lần)

Trang server import GIÁ TRỊ (hàm, hằng số) từ file `"use client"` chỉ nhận được
**tham chiếu client**: gọi hàm → lỗi 500 (`tierOf`, P3); dùng hằng số →
`.slice(0, ref)` ra mảng rỗng, KHÔNG báo lỗi (`COMPARE_MAX`, P5). Hằng số, kiểu,
hàm thuần dùng chung giữa server và client → để ở module thường (`*.ts`, không
`"use client"`): `page/tiers.ts`, `finder/bins.ts`, `compare/compare-types.ts`.

## PROHIBITED (TUYỆT ĐỐI KHÔNG)

1. ❌ Tạo custom chart component khi ReUI chart block có sẵn
2. ❌ Tạo custom table khi @reui/data-grid-* có sẵn
3. ❌ Hardcode màu hex khi Tailwind tokens có sẵn
4. ❌ Viết custom CSS khi Tailwind utilities đủ dùng
5. ❌ Tạo component > 200 dòng (tách nhỏ)
6. ❌ Không import ReUI block trong server component (blocks cần "use client")
7. ❌ Commit .env.local (chứa REUI_LICENSE_KEY)

## INSTALL COMMANDS (copy-paste)

```bash
# Luôn chạy từ app/ directory
cd app

# Install ReUI block (cần license key trong .env.local)
npx shadcn@latest add @reui/<block-name>

# Install shadcn base component
npx shadcn@latest add <component-name>

# Examples:
npx shadcn@latest add @reui/c-chart-16
npx shadcn@latest add @reui/c-card-15
npx shadcn@latest add @reui/c-data-grid-11
npx shadcn@latest add button card dialog
```

## VERIFY sau khi install

```bash
# 1. Build không lỗi
npm run build

# 2. Import hoạt động
# Data grid engine: import { DataGrid } from "@/components/reui/data-grid/data-grid"
# Pattern demo:     xem src/components/examples/c-chart-16.tsx

# 3. Update DESIGN_RULES.md inventory (thêm block mới vào bảng)
```
