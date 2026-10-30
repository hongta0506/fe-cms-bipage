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
- [ ] `npx tsc --noEmit` passes with 0 errors.
- [ ] `npm run build` compiles all routes successfully.
- [ ] Deploy to production `admin.xskt24h.net` and verify UI in browser.
