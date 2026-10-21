# ADR-0006: Agent Swarm Data Collection — Kiến trúc Hub-and-Spoke

Ngày: 2026-10-18 · Trạng thái: accepted (sửa đổi bởi ADR-0007: agent-report
ghi raw snapshot theo DATA-CONTRACT trước khi vào staging — không insert
thẳng `stg_zalo_posts` như diagram cũ; conduct thu thập tuân theo CCP)

## Bối cảnh

User có Mac Studio + MacBook Pro M5 Max 128GB, luôn bật, có thể mua public IP.
Sẵn có Vercel + Supabase. Dự định chạy LLM local (Qwen 27B). Một OpenClaw
agent có thể join nhiều group; thêm agent chỉ là backup/mở rộng coverage.

**Thay vì distributed swarm (agents trên máy khác nhau), kiến trúc tối ưu
là Hub-and-Spoke: tất cả agents trên MỘT máy (Mac Studio), tập trung data
về local PostgreSQL, sync lên cloud cho Vercel Dashboard.**

## Quyết định kiến trúc

### Tổng quan 3 tầng

```
TẦNG 1 — THU THẬP (Mac Studio, always on)
  OpenClaw Agent(s) + Qwen 27B + One Invest Collector API

TẦNG 2 — LƯU TRỮ & XỬ LÝ (Mac Studio local)
  PostgreSQL + PostGIS + Pipeline (transform + metrics)

TẦNG 3 — HIỂN THỊ & CHIA SẺ (Vercel + Supabase)
  Next.js Dashboard + Auth + Cloud DB (sync từ local)
```

### Diagram 1: Data Flow (dòng dữ liệu end-to-end)

```
┌─────────────────────────────────────────────────────────────────────┐
│                        MAC STUDIO (Hub)                             │
│                                                                     │
│  ┌──────────────┐    ┌──────────────┐    ┌─────────────────────┐   │
│  │  OpenClaw    │    │  OpenClaw    │    │  OpenClaw           │   │
│  │  Agent #1    │    │  Agent #2    │    │  Agent #N (backup)  │   │
│  │  (Zalo cá   │    │  (Zalo bot/ │    │  (Zalo account #N)  │   │
│  │   nhân)      │    │   claw)      │    │                     │   │
│  └──────┬───────┘    └──────┬───────┘    └──────────┬──────────┘   │
│         │                    │                        │              │
│         │  Monitor Zalo Groups (read-only)           │              │
│         │                    │                        │              │
│         ▼                    ▼                        ▼              │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │           Qwen 27B (Local LLM) — Data Extraction           │   │
│  │                                                           │   │
│  │  Input:  Raw Zalo/FB group message (text VN)              │   │
│  │  Output: JSON {type, price, area, phường, bedrooms, ...}   │   │
│  │  Filter: Chỉ tin BĐS (bỏ qua chat/social)                 │   │
│  └──────────────────────────┬──────────────────────────────────┘   │
│                              │                                     │
│                              ▼                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │     One Invest Collector API (localhost:9210)                │   │
│  │                                                           │   │
│  │  POST /api/agent-report                                    │   │
│  │  { agent_id, group, messages: [{text, extracted, ts}] }   │   │
│  │  → Validate → stg_zalo_posts → transform → canonical       │   │
│  └──────────────────────────┬──────────────────────────────────┘   │
│                              │                                     │
│                              ▼                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │           PostgreSQL + PostGIS (localhost:5433)              │   │
│  │                                                           │   │
│  │  staging → transform → canonical → metrics → yield        │   │
│  │  (same pipeline as Airbnb/AirDNA collectors)               │   │
│  └──────────────────────────┬──────────────────────────────────┘   │
│                              │                                     │
└──────────────────────────────┼──────────────────────────────────────┘
                               │ Sync (every 15 min or on-demand)
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    SUPABASE (Cloud DB)                              │
│                                                                     │
│  Cloud replica: areas, listings, market_metrics, sale_offers,     │
│  airdna_ref, market_asset_stats (read-only from local)            │
└──────────────────────────────────┬──────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    VERCEL (Dashboard)                               │
│                                                                     │
│  Next.js One Invest Dashboard                                      │
│  ├── /vn — Tổng quan toàn quốc (AirDNA markets)                    │
│  ├── /vn/hanoi — Hà Nội (tự thu + AirDNA đối chiếu)               │
│  ├── /vn/hcmc — HCMC (tự thu + phường)                            │
│  ├── /vn/hanoi/[phường] — Chi tiết từng phường + yield            │
│  └── Auth: user (admin) + teammates (read-only, tuỳ chọn)        │
│                                                                     │
│  URL: https://one-invest.vercel.app (hoặc custom domain)         │
└─────────────────────────────────────────────────────────────────────┘
```

### Diagram 2: Agent Skill (OpenClaw → One Invest bridge)

```
┌─────────────────────────────────────────────────────────┐
│  OpenClaw Agent Skill: "real-estate-monitor"            │
│                                                       │
│  ┌─────────────┐    ┌──────────────┐    ┌─────────┐ │
│  │  Trigger:    │    │  Process:    │    │  Output: │ │
│  │  New group   │───▶│  Qwen 27B    │───▶│  POST   │ │
│  │  message     │    │  extract     │    │  JSON   │ │
│  │  (heartbeat  │    │  structured  │    │  to     │ │
│  │  30s)        │    │  data        │    │  API    │ │
│  └─────────────┘    └──────────────┘    └─────────┘ │
│                                                       │
│  Skill config:                                       │
│  - groups: ["BĐS Hà Nội", "Chung cư SG", ...]        │
│  - filter_prompt: "Extract real estate listings:      │
│      type (sale/rent_lt), price, area_m2, phường,     │
│      bedrooms, phone. Return null if not BĐS."       │
│  - api_endpoint: "http://localhost:9210/api/agent-report" │
│  - api_key: "one-invest-agent-{agent_id}"            │
│  - llm: "http://localhost:11434/api/generate"        │
│    (Ollama running Qwen 27B)                          │
└─────────────────────────────────────────────────────────┘
```

### Diagram 3: Deployment topology

```
┌──────────────────────────────────────────┐
│         USER'S DESK / HOME               │
│                                          │
│  ┌──────────────┐  ┌──────────────────┐ │
│  │  Mac Studio  │  │  MacBook Pro     │ │
│  │  (always on) │  │  M5 Max 128GB    │ │
│  │              │  │  (dev machine)   │ │
│  │  - OpenClaw  │  │                  │ │
│  │  - Qwen 27B  │  │  - ZCode/AI dev  │ │
│  │  - PostgreSQL│  │  - Deploy to     │ │
│  │  - Collector │  │    Vercel        │ │
│  │    API       │  │                  │ │
│  │  - Sync job  │  │                  │ │
│  └──────────────┘  └──────────────────┘ │
│          │                    │          │
│          │ Public IP /        │          │
│          │ Cloudflare Tunnel  │          │
│          ▼                    ▼          │
└──────────────────────────────────────────┘
           │                  │
           ▼                  ▼
┌──────────────────┐  ┌──────────────────┐
│    SUPABASE      │  │     VERCEL       │
│                  │  │                  │
│  Cloud Postgres  │  │  Next.js App     │
│  (read replica)  │  │  Dashboard       │
│                  │  │  Auth            │
└──────────────────┘  └──────────────────┘
```

## Thành phần cần build

### Đã có (từ các giai đoạn trước)
- ✅ One Invest Dashboard (Next.js)
- ✅ PostgreSQL + PostGIS + pipeline
- ✅ Airbnb collectors (discovery + listing)
- ✅ AirDNA collector + đối chiếu
- ✅ OSM boundaries collector
- ✅ Transform + metrics + yield

### Cần build mới (theo thứ tự)

| # | Thành phần | Mô tả | Độ phức tạp |
|---|---|---|---|
| 1 | **Ollama + Qwen 27B** | Cài trên Mac Studio, expose port 11434 | Thấp (1 lệnh) |
| 2 | **OpenClaw Agent** | Cài trên Mac Studio, connect Zalo QR | Thấp (docs có sẵn) |
| 3 | **Agent Skill: real-estate-monitor** | Custom skill extract + POST | Trung bình |
| 4 | **Collector API endpoint** | `POST /api/agent-report` nhận JSON từ agents | Thấp |
| 5 | **Transform: agent-report → stg_zalo_posts** | Map JSON format vào staging hiện có | Thấp |
| 6 | **Sync job: local → Supabase** | Cron đẩy data lên cloud DB | Trung bình |
| 7 | **Vercel deployment** | Deploy Next.js + env vars cho Supabase | Thấp |
| 8 | **Auth cho teammates** | Tuỳ chọn: magic link hoặc simple API key | Thấp |

## Lý do chọn Hub-and-Spoke (không distributed)

1. **Tất cả agents trên 1 máy**: không cần cross-machine sync ở tầng agent
2. **LLM local (Qwen 27B)**: không tốn API phí, full privacy, low latency
3. **PostgreSQL local**: pipeline hiện có giữ nguyên, chỉ thêm sync lên cloud
4. **1 điểm bảo mật**: Collector API chỉ nhận từ localhost (hoặc VPN)
5. **Backup đơn giản**: thêm OpenClaw agent = thêm Zalo account = thêm group coverage

## "Teammate Agents" (mở rộng)

User có thể tạo thêm Zalo accounts chỉ để join groups:
- Mỗi account = 1 OpenClaw agent instance
- Agents có thể chạy cùng lúc trên Mac Studio (multi-agent routing)
- Tất cả POST về cùng Collector API
- User kiểm soát hoàn toàn (không phụ thuộc người thật)

```
Agent #1 (Zalo cá nhân)  → Groups A, B, C      ─┐
Agent #2 (Zalo claw bot) → Groups D, E, F       ├─→ POST /api/agent-report
Agent #3 (Zalo account)  → Groups G, H, I       ─┘       ↓
                                                         Collector API
                                                         PostgreSQL
                                                         → Sync → Vercel
```

## So sánh với các nền tảng đã research

| Tiêu chí | OpenClaw (chọn) | AutoClaw | Hermes |
|---|---|---|---|
| Zalo support | ✅ QR pairing | ✅ | Chưa rõ |
| Self-hosted | ✅ Full control | ❌ Desktop app | ✅ |
| Custom skills | ✅ Open format | ✅ 50+ built-in | ✅ |
| Local LLM | ✅ Bất kỳ (Ollama) | ❌ GLM only | ✅ |
| Cost | Free + LLM local | Pay-as-you-go | Free + LLM |
| Multi-agent | ✅ Per-agent isolation | ✅ | Đang evolve |

**Chọn OpenClaw**: open-source, Zalo native, custom skills linh hoạt,
chạy Qwen 27B local qua Ollama, multi-agent trên cùng gateway.
