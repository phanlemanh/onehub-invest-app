# ADR-0007: Nền tảng vận hành collector — SPL · CCP · DCA · DQO · DR

Ngày: 2026-10-18 · Trạng thái: accepted · Kèm theo: ROADMAP v3 (C1–C4),
portals.md (clearance law), ADR-0006 (sửa đổi agent-report qua raw zone)

## Bối cảnh

Ba định hướng từ user (2026-10-18), sau khi rà tầm nhìn Collector (ADR-0003/4/5/6,
DATA-CONTRACT, ROADMAP v2):

1. **Mã hoá danh tính nguồn** — tên nguồn thật không ra ngoài hệ; mã quy ước
   được bảo vệ như lớp chắn bí mật.
2. **Collector hành vi gần người nhất** — giả thuyết nền: platform (website,
   group, Zalo) không thích trợ lý AI; mục tiêu là vận hành ít thay đổi, bền.
3. **Mỗi giai đoạn phục vụ 2 lớp người dùng** — người (GUI) và máy (API/MCP)
   — để vận hành ra quyết định liên tục.

Review theo best practices ngành (data engineering, SRE, privacy, API design)
→ chuẩn hoá tên gọi + bổ sung 2 lớp ngành bắt buộc mà tầm nhìn còn thiếu:
Data Quality/Observability và Backup/Recovery.

## Quyết định — 5 workstream xuyên suốt C1–C4

### 1. SPL — Source Pseudonymization Layer

Pseudonymization (GDPR Art. 4(5); ngành alternative-data: "Vendor A/B").
Ba tầng danh tính, mỗi tầng cho một đối tượng:

| Tầng | Giá trị | Ai thấy | Nơi sống |
|---|---|---|---|
| **A — Sự thật** | `airbnb-self`, `airdna`, `zalo`… | không ai ngoài máy local + role admin ở `/ops/sources` | raw zone, Postgres local, bảng `source_registry` |
| **B — Mã ổn định** | `S01`, `S02`… | máy (API/MCP), nội bộ serving | cột `source` mọi bảng serving, API response |
| **C — Nhãn ngữ nghĩa** | "Tự thu" / "Hiệu chuẩn" / "Cộng đồng" / "Địa giới mở" | người dùng GUI | i18n dict (vi/en), UI — không thấy tên thương hiệu |

Quy ước:
- **Mã gắn nguồn thực, ổn định vĩnh viễn** (lineage máy đọc được khi đổi vendor).
  **Nhãn gắn vai trò** — đổi vendor cùng vai trò → người dùng không thấy gì đổi
  (khớp "vai trò trôi" ADR-0005). Đổi nhãn công khai phải qua mini-ADR.
- `source_registry` (mapping A↔B + metadata vòng đời) **không commit, không
  sync cloud, không rời máy local**. Nguồn chết → mã `retired` vĩnh viễn,
  không tái sử dụng (trường `status`, `since`, `retired_at`).
- **Leak Gate trong CI**: job grep tên-thật trên mọi artifact rời máy (bundle
  Vercel, schema Supabase, API response snapshot, log) — fail CI nếu thấy.
- Tầng cloud-sync đổi tên bảng vendor sang trung tính (`airdna_*` →
  `ref_calib_*`…); cột `source` ở đó chỉ chứa mã B.
- `/ops/sources` là bảng giải mã duy nhất, gated `role=admin` (portals.md).
- Bảo mật qua che giấu ≠ access control: SPL chống lộ *tình cờ* (log, dump,
  screenshot, bundle), không chống kẻ đã có quyền admin.

### 2. CCP — Collection Conduct Policy

Politeness policy + low-signature OPSEC. Nguyên tắc nền: platform phát hiện
**chữ ký hành vi** (nhịp metronome, volume vượt người, identity rotation),
không phát hiện "AI". Mục tiêu: hành vi quan sát được không khác một người
dùng chấp nhận được.

1. **Cadence người**: jitter 2–15s giữa thao tác; trần volume/ngày; cửa sổ giờ
   hoạt động 19–23h; cron có randomized delay trong cửa sổ (systemd
   `RandomizedDelaySec` tương đương).
2. **Incremental trước tiên**: lịch 60 đêm gần fetch 2×/tuần, toàn bộ 1×/tháng
   — giảm khối lượng gốc thay vì che khối lượng.
3. **Một identity một nguồn**: persistent profile (đã có), không xoay, không
   đa tab song song.
4. **Chỉ đọc là mặc định**: agent Zalo event-driven đọc tin mới; tính năng
   "agent hỏi lại môi giới" để mức TẮT mặc định.
5. **Fail = lùi + báo**: exponential backoff with full jitter (AWS) — base
   30s × 2^n, trần 24h, reset khi thành công. Circuit breaker 3 trạng thái
   (Nygard): ≥3 block/24h → open; 1 probe sau 24h → half-open. Cảnh báo qua
   webhook (DCA), không tự xoay identity.
6. **Cấm mặc định**: anti-detect browser, fingerprint spoofing, xoay đa
   account — **loại khỏi hướng research** (đã sửa agent-swarm-vision.md).
   Một account thật, đọc chậm, không bao giờ đăng.
7. **Smoke test hằng ngày**: discovery 1 trang verify selector + số link —
   phát hiện markup đổi trong 24h.
8. **Credential registry**: chủ sở hữu, đường khởi phục, hạn subscription,
   lịch người-login-thật định kỳ. **Source risk register**: mỗi nguồn 1 dòng
   (điều khoản ToS đã biết, giới hạn tự đặt, tín hiệu cảnh báo, tần suất duyệt).
9. **PII**: số ĐT môi giới là personal data — tầng serving chỉ lưu **hash**
   cho dedup, không plaintext; raw giữ 24 tháng (data minimization ADR-0003).
10. **SLO vận hành**: collector chạy 4 tuần không đụng tay; đếm block/tháng
    làm chỉ số sức khoẻ (`/ops`).

### 3. DCA — Dual-Consumer Architecture

API-first + MCP. Quy tắc: **tính năng nào ra đời phải có cả GUI lẫn API/MCP
trong cùng phase** — không "API để sau".

- **OpenAPI 3 spec contract-first** ngày đầu; versioning `/api/v1/…`; MCP tool
  namespaced `oneinvest_*`; breaking change qua ADR.
- **RBAC role × scope**: `read:public` / `read:ops` / `ops:write` / `admin`;
  machine token tách riêng người dùng; bảng phân quyền ghi trong spec.
- **Audit log bắt buộc** mọi `ops:write`: token nào, lệnh gì, khi nào, kết quả
  (xem `/ops/audit`).
- **Idempotency-Key** (Stripe/IETF) cho mọi trigger collect/transform.
- **Health chuẩn SRE**: `/api/health` (liveness) + `/api/ops/metrics`;
  webhook payload versioned + retry + dead-letter.
- **Phạm vi: internal-first** (user + agent + teammate). Public read API =
  quyết định ADR riêng, không mặc định.

### 4. DQO — Data Quality & Observability

4 trụ (dbt tests / Great Expectations / Monte Carlo): **freshness, volume,
schema, distribution**.

- Test sau mỗi transform (`pipeline/sql/450_dq_checks.sql`): miền giá trị
  (occupancy 0–100%), volume bất thường (listings giảm >20% so snapshot
  trước), phân phối lệch (median ADR đổi >30%), khóa not-null.
- **Freshness SLO per nguồn**: discovery ≤8 ngày · listings ≤7 · offers ≤3 ·
  tham chiếu ≤35. Hiển thị cả GUI (footer trang Insight) lẫn API; vi phạm →
  webhook.
- Gốc: incident "ADR pha loãng bởi đêm thiếu giá" (4f3a65e) lẽ ra bị test
  phân phối bắt ngay — quy tắc: mỗi incident dữ liệu sinh ra đúng 1 test.

### 5. DR — Backup & Recovery

- `pg_dump` hằng tuần + rsync mã hoá raw zone sang đĩa ngoài.
- `source_registry` mapping + credentials vào macOS Keychain.
- **RPO 7 ngày / RTO 1 ngày** (quy mô cá nhân, chấp nhận bởi user).
- Drill khôi phục 1 lần ở C4 (kiểm chứng, không giấy tờ).
- `migrate-export.sh` là đóng gói chuyển máy, KHÔNG phải lịch backup.

## Threat model SPL (tóm tắt 1 trang)

- **Tài sản**: `source_registry` mapping, raw zone, credentials, audit log.
- **Đường lộ**: cloud DB sync (Supabase), bundle Vercel, API response, log,
  screenshot do người chia sẻ.
- **Actor**: người dùng công khai (chỉ thấy tầng C), teammate read-only
  (tầng C + mã B), bên thứ ba nếu cloud bị lộ (chỉ mã B + bảng trung tính).
- **Không bảo vệ**: thứ actor không với tới (raw local, mapping local) —
  ngoài backup và phân quyền file hệ thông thường.

## Lệch chuẩn có chủ đích

Chuẩn crawler truyền thống yêu cầu tự xưng danh (User-Agent, robots.txt).
CCP chủ động không theo. Lý do: bối trang cá nhân phi thương mại, platform
chặn bot "lịch sự" nhanh hơn chặn người dùng nặng; ranh giới tự đặt là
volume + chỉ-đọc thay vì tự xưng danh. Ghi nhận như lệch chuẩn được chấp
nhận — không khuyến khích nhân bản sang bối cảnh khác.

## Sửa đổi ADR-0006 (agent-report qua raw zone)

Diagram cũ của ADR-0006 vẽ `POST /agent-report → stg_zalo_posts` trực tiếp.
Sửa theo bất biến ADR-0003: agent-report **ghi raw snapshot theo
DATA-CONTRACT** (`source='zalo-agent'`, manifest + sha256) rồi mới transform
vào staging. Mất thêm 1 tầng ghi file; đổi lại re-parse được khi logic
extract đổi + audit được nguồn. ADR-0006 → accepted kèm sửa đổi này.

## Các quyết định chốt kèm (user, 2026-10-18)

1. Nhãn tầng C: "Tự thu / Hiệu chuẩn / Cộng đồng / Địa giới mở";
   `/phuong-phap` không nêu tên thương hiệu.
2. Anti-detect (Dolphin/Multilogin/fingerprint): LOẠI khỏi research.
3. API/MCP C4: internal-first; public read = ADR riêng.
4. PII số ĐT: hash cho dedup, không plaintext ở serving.
5. RPO 7 ngày / RTO 1 ngày.

## Hệ quả

- Mọi phase C1–C4 trong ROADMAP v3 có 5 cột workstream.
- `users` thêm cột `role` (`user`|`admin`) ở C1 — clearance law portals.md.
- Bảng `airdna_*` giữ nguyên ở local; đổi tên trung tính bắt đầu từ tầng
  cloud-sync (C4) kèm Leak Gate.
