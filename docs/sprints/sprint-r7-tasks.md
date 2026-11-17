# Sprint R7 — Admin Reward Engine & Nakama Operations Console

Tracking issue: https://github.com/hongta0506/xskt24h-docs/issues/37
Project: `XSKT24H Reward Engine` (#8)

## 1. Context & Objectives
Tích hợp các module quản trị Reward Engine vào Admin Dashboard (`fe-cms-bipage`), kết nối trực tiếp với Nakama Game Server và FastSchema:
- **Task #38:** Màn hình quản lý Giải thưởng & Ma trận xác suất (`/dashboard/rewards/prizes`), hiển thị trực quan tỷ lệ trúng theo Tier và Publish sang Nakama runtime.
- **Task #39:** Màn hình Người chơi (`/dashboard/rewards/players`), tra cứu số dư, lịch sử biến động điểm ledger từ Nakama và công cụ điều chỉnh điểm thủ công.
- **Task #40:** Màn hình Nhật ký Quay thưởng (`/dashboard/rewards/spins`) và Quản lý Duyệt đổi quà (`/dashboard/rewards/claims`) với quy trình tự động hoàn điểm khi từ chối.
- **Task #41:** Màn hình Bảng xếp hạng realtime (`/dashboard/rewards/leaderboards`) lấy dữ liệu từ Nakama leaderboards.

## 2. Architecture & API Routes
Thực hiện qua BFF proxy an toàn trong Next.js server-side (`src/lib/reward-bridge/service.ts`) được xác thực bởi admin session cookie (`auth-token`) và `REWARD_CONFIG_ADMIN_SECRET`:
- `GET /api/rewards/spins`: Proxy gọi Nakama RPC `reward_spins_list_admin_v1`.
- `GET /api/rewards/players`: Lấy danh sách users kèm số dư Nakama.
- `GET /api/rewards/players/[id]`: Proxy gọi Nakama RPC `reward_player_get_admin_v1`.
- `POST /api/rewards/players/[id]/adjust`: Proxy gọi Nakama RPC `reward_points_adjust_admin_v1`.
- `GET /api/rewards/claims`: Proxy gọi Nakama RPC `reward_redemptions_admin_v1` (action=list).
- `POST /api/rewards/claims/[id]/update`: Proxy gọi Nakama RPC `reward_redemptions_admin_v1` (action=update_status).
- `GET /api/rewards/leaderboards`: Proxy gọi Nakama RPC `leaderboard_get_v1`.

## 3. UI Components & Pages
- Thêm nhóm "Vòng quay & Thưởng" trong `sidebar-items.ts`:
  - Cấu hình giải thưởng (`/dashboard/rewards/prizes`)
  - Xuất bản cấu hình (`/dashboard/rewards/publish`)
  - Người chơi & Điểm (`/dashboard/rewards/players`)
  - Lịch sử quay thưởng (`/dashboard/rewards/spins`)
  - Quản lý đổi quà (`/dashboard/rewards/claims`)
  - Bảng xếp hạng (`/dashboard/rewards/leaderboards`)
- Sử dụng UI primitives chuẩn từ `@/components/ui/*`: `Button`, `Table`, `Badge`, `Dialog`, `Input`, `Select`, `Card`, `Tabs`.
- Hỗ trợ song ngữ VI/EN đầy đủ qua `LocaleProvider`.

## 4. Verification Checklist
- [x] Nakama RPCs tested on staging: `reward_spins_list_admin_v1`, `reward_player_get_admin_v1`, `reward_points_adjust_admin_v1`, `reward_redemptions_admin_v1`, `leaderboard_get_v1`.
- [x] `npx tsc --noEmit` passes with 0 errors.
- [x] `npm run build` compiles all routes successfully.
- [x] Deploy to production `admin.xskt24h.net` and verify UI in browser.

### 4.1 Verification evidence (2026-11-17)

**TypeScript** — `npx tsc --noEmit` → exit `0`, zero diagnostics.

**Build** — `npx next build` → exit `0`. All six reward pages compiled as dynamic
(`ƒ`) routes: `claims`, `leaderboards`, `players`, `prizes`, `publish`, `spins`.
Also compiled the ten `/api/rewards/*` handlers below.

**Deployment** — both environments run commit `7f044de`
(`fix(rewards): add auth headers and Nakama fallback to prizes console (#20)`):

| Env | Host | Commit | BUILD_ID | pm2 | Reward routes in manifest |
|---|---|---|---|---|---|
| Production | `admin.xskt24h.net` (:3005) | `7f044de` | `pSeUPvYgxhv65UTvJrKmb` | online, 0 restarts | 16 |
| Staging | `admin-staging.xskt24h.net` (:3015) | `7f044de` | `htk0Rj1oea8OW4Hp7x2Oj` | online, 0 restarts | 16 |

**UI** — logged in via `POST /api/auth/local/login` and fetched every page with the
`token` + `auth-token` cookies. No `/auth/*` redirects, every page rendered
(113–131 KB of HTML):

| Route | Production | Staging |
|---|---|---|
| `/dashboard/rewards/prizes` | 200 · 122,120 B | 200 · 122,120 B |
| `/dashboard/rewards/players` | 200 · 116,511 B | 200 · 116,511 B |
| `/dashboard/rewards/spins` | 200 · 121,524 B | 200 · 121,524 B |
| `/dashboard/rewards/claims` | 200 · 131,146 B | 200 · 131,146 B |
| `/dashboard/rewards/leaderboards` | 200 · 127,301 B | 200 · 127,301 B |
| `/dashboard/rewards/publish` | 200 · 113,849 B | 200 · 113,849 B |

**BFF → Nakama** — every API answered `200` with a valid `contractVersion: 1`
envelope, proving the bridge reaches the Nakama runtime:

| Endpoint | Production | Staging |
|---|---|---|
| `/api/rewards/current` | 200 · 4,227 B · version 1 | 200 · 4,231 B · version 1 |
| `/api/rewards/players` | 200 · `players=0` | 200 · `players=20` |
| `/api/rewards/spins` | 200 · `spins=0` | 200 · `spins=41` |
| `/api/rewards/claims` | 200 · `items=0` | 200 · `items=0` |
| `/api/rewards/leaderboards` | 200 · `topPoints`+`topSpins` | 200 · 1,589 B |

Production shows empty player/spin collections because its `reward_production`
database is fresh; staging still carries test fixtures. This is expected after the
Nakama cluster split, not a defect.

**Active reward config** — the two environments hold genuinely independent active
versions, confirming the cluster split works:

| Env | Active version | Hash (prefix) | Published at | Tiers | Tasks |
|---|---|---|---|---|---|
| Production | 1 | `30e11d5f8523323cc8fd23c6eea6f62f` | 2026-10-30T07:24:39Z | 3 | 1 |
| Staging | 1 | `0c0acd9f2ec87cce8ba3f272e8f3f210` | 2026-10-28T07:15:10Z | 3 | 1 |

## 5. Release notes / deviations from the original plan

Two endpoints exist in the shipped build but were not in the original §2 spec:

- `GET /api/rewards/current` — reads the active config plus its version history;
  also the fallback source the prizes console uses when FastSchema returns no rows.
- `POST /api/rewards/rollback` — rolls the active config back to a previous version
  via Nakama RPC `reward_config_rollback_v1`.

Both are additive; no spec route was dropped.

Known issue fixed during rollout: `/api/rewards/publish` returned
`500 config storage unavailable` from `reward_config_publish_v1` whenever the
FastSchema `reward_task` collection was empty, because `assembleConfig` produced
`tasks: []` and the read-back check `len(storedTasks.Tasks) == 0` failed. Seeding a
single task (`t1`, "Đăng ký & Điểm danh Tân Thủ", `one_time`/`auth`, 1000 pts,
sort 1) into both `fastschema` and `fastschema_staging` resolved it.
