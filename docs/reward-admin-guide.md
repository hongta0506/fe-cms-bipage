# Hướng dẫn quản trị Reward Engine

## Bắt đầu nhanh

1. Đăng nhập admin dashboard bằng tài khoản có quyền quản trị nội dung và cấu hình reward.
2. Tạo hoặc cập nhật dữ liệu tại các trang **Reward Tier**, **Reward Prize** và **Reward Task**.
3. Kiểm tra checklist ở mục 8.
4. Mở **Rewards → Publish**, bấm **Kiểm tra và xuất bản**.
5. Xác nhận phiên bản mới xuất hiện ở **Phiên bản đang dùng** trước khi kiểm tra trên website.

> Lưu ý: **Save/Create chỉ lưu dữ liệu trong FastSchema.** Cấu hình chỉ có hiệu lực trên Nakama sau khi Publish thành công.

## Tổng quan

Admin dashboard quản lý giải thưởng qua 3 bảng dữ liệu trong FastSchema:

| Bảng | Đường dẫn | Vai trò |
|---|---|---|
| `reward_tier` | `/dashboard/content/reward_tier` | Gói quay (bậc thưởng) |
| `reward_prize` | `/dashboard/content/reward_prize` | Giải thưởng trong mỗi gói |
| `reward_task` | `/dashboard/content/reward_task` | Nhiệm vụ tích điểm |
| — | `/dashboard/rewards/publish` | Kiểm tra, Publish và Rollback cấu hình |

Sau khi tạo/sửa dữ liệu, phải **Publish** tại `/dashboard/rewards/publish` để cấu hình mới có hiệu lực trên Nakama.

---

## 1. Tạo gói quay (Reward Tier)

Mở `/dashboard/content/reward_tier` → bấm **New**.

| Trường | Kiểu | Bắt buộc | Mô tả | Ví dụ |
|---|---|---|---|---|
| `tier_id` | string | Có | ID duy nhất, dùng liên kết prize | `daily` |
| `tier_name` | string | Có | Tên hiển thị | `Quay hằng ngày` |
| `cost_per_spin` | number | Có | Số điểm trừ mỗi lượt quay (0 = miễn phí) | `0` |
| `max_spins` | number | Không | Giới hạn lượt quay mỗi chu kỳ (trống = không giới hạn) | `1` |
| `period` | string | Không | Chu kỳ reset lượt quay | `daily` |
| `allowed_days` | number[] | Không | Ngày trong tuần cho phép quay (1=T2, 7=CN) | `[1,2,3,4,5,6,7]` |
| `enabled` | bool | Có | Bật/tắt gói | `true` |
| `sort_order` | number | Có | Thứ tự hiển thị (nhỏ = trước) | `1` |

Bấm **Create**.

---

## 2. Tạo giải thưởng (Reward Prize)

Mở `/dashboard/content/reward_prize` → bấm **New**.

| Trường | Kiểu | Bắt buộc | Mô tả | Ví dụ |
|---|---|---|---|---|
| `tier_id` | string | Có | ID gói quay chứa giải (phải trùng với `tier_id` ở bảng tier) | `daily` |
| `prize_id` | string | Có | ID duy nhất của giải | `voucher-10k` |
| `name` | string | Có | Tên hiển thị trên vòng quay | `Voucher 10.000đ` |
| `points` | number | Có | Số điểm thưởng khi trúng (0 nếu giải là vật phẩm) | `100` |
| `weight` | number | Có | Trọng số xác suất (xem mục 5) | `10` |
| `schedule_date` | string | Không | Ngày giải có hiệu lực (xem mục 4) | `2026-08-20` |
| `schedule_start` | string | Không | Giờ bắt đầu phát giải | `09:00` |
| `schedule_end` | string | Không | Giờ kết thúc phát giải | `21:00` |
| `enabled` | bool | Có | Bật/tắt giải | `true` |
| `sort_order` | number | Có | Thứ tự hiển thị trên vòng quay (nhỏ = trước) | `1` |

Bấm **Create**.

---

## 3. Tạo nhiệm vụ tích điểm (Reward Task)

Mở `/dashboard/content/reward_task` → bấm **New**.

| Trường | Kiểu | Bắt buộc | Mô tả | Ví dụ |
|---|---|---:|---|---|
| `task_id` | string | Có | ID duy nhất của nhiệm vụ | `daily-checkin` |
| `title` | string | Có | Tên hiển thị | `Điểm danh hôm nay` |
| `description` | string | Không | Mô tả nhiệm vụ | `Mở trang điểm danh` |
| `task_type` | string | Có | Nhóm nhiệm vụ | `daily` |
| `action_type` | string | Có | Hành động cần thực hiện | `checkin` |
| `target_route` | string | Không | Route người dùng cần mở/thực hiện | `/diem-danh` |
| `required_count` | number | Không | Số lần yêu cầu nếu nhiệm vụ có đếm lượt | `1` |
| `reward_points` | number | Có | Số điểm nhận sau khi claim | `10` |
| `max_daily_claims` | number | Không | Số lần claim tối đa mỗi ngày | `1` |
| `cooldown_sec` | number | Không | Thời gian chờ giữa các lần claim, tính bằng giây | `86400` |
| `prerequisites` | string[] | Không | Danh sách `task_id` phải hoàn thành trước | `[]` |
| `starts_at` | string | Không | Thời điểm bắt đầu hiệu lực | ISO 8601 |
| `ends_at` | string | Không | Thời điểm kết thúc hiệu lực | ISO 8601 |
| `enabled` | bool | Có | Bật/tắt nhiệm vụ | `true` |
| `sort_order` | number | Có | Thứ tự hiển thị | `1` |

Bấm **Create**. Chỉ nhiệm vụ có `enabled = true` được đưa vào cấu hình khi Publish.

---

## 4. Cấu hình ngày và giờ phát giải

Mỗi giải có 3 trường lịch:

| Trường | Format | Ví dụ |
|---|---|---|
| `schedule_date` | `YYYY-MM-DD` | `2026-08-20` |
| `schedule_start` | `HH:mm` | `09:00` |
| `schedule_end` | `HH:mm` | `21:00` |

### Quy tắc

- **Để trống cả 3**: giải phát mọi lúc (không giới hạn thời gian).
- **Chỉ điền `schedule_date`**: giải chỉ phát đúng ngày đó, cả ngày.
- **Chỉ điền `schedule_start` + `schedule_end`**: giải phát mỗi ngày trong khung giờ.
- **Điền cả 3**: giải chỉ phát đúng ngày, đúng khung giờ.

### Ví dụ cấu hình

**Giải phát mỗi ngày từ 18h–21h:**

```
schedule_date:  (trống)
schedule_start: 18:00
schedule_end:   21:00
```

**Giải phát 1 ngày duy nhất:**

```
schedule_date:  2026-08-20
schedule_start: 09:00
schedule_end:   21:00
```

> **Lưu ý timezone**: Dashboard gửi giờ nguyên dạng chuỗi. Nakama diễn giải theo timezone server (mặc định UTC). Nếu server chạy UTC, nhập `09:00` nghĩa là 16:00 giờ Việt Nam (UTC+7). Cần quy ước thống nhất trước khi cấu hình production.

---

## 5. Cấu hình xác suất (Weight)

`weight` là **trọng số tương đối**, không phải phần trăm.

### Thuật toán

Nakama dùng **weighted random** với `crypto/rand`:

1. Tính tổng weight tất cả giải đang active trong tier.
2. Sinh số ngẫu nhiên từ `0` đến `tổng - 1`.
3. Duyệt giải theo thứ tự, trừ dần weight cho đến khi hết.

### Ví dụ

| Giải | Weight | Xác suất |
|---|---:|---|
| 50 Điểm | 4000 | 4000/14000 ≈ 28.6% |
| 100 Điểm | 3000 | 3000/14000 ≈ 21.4% |
| Thẻ cào 20k | 1500 | 1500/14000 ≈ 10.7% |
| 30 Điểm | 1000 | 1000/14000 ≈ 7.1% |
| Thẻ cào 50k | 400 | 400/14000 ≈ 2.9% |
| 30 Điểm | 1000 | 1000/14000 ≈ 7.1% |
| 100 Điểm | 3000 | 3000/14000 ≈ 21.4% |
| Thẻ cào 100k | 100 | 100/14000 ≈ 0.7% |

### Giới hạn

- `weight` phải **> 0** (giải weight = 0 bị bỏ qua).
- `weight` tối đa **1.000.000** mỗi giải.
- Không bắt buộc tổng weight = 100 hay 10000.
- Nên dùng **số nguyên** dễ kiểm tra.

### Mẹo tính nhanh

Muốn giải A có xác suất ~1%:

```
weight giải A = 100
tổng weight các giải còn lại = 9900
→ 100 / 10000 = 1%
```

---

## 6. Publish cấu hình

Sau khi tạo/sửa tier và prize, mở:

```
/dashboard/rewards/publish
```

Bấm **Publish**. Hệ thống sẽ:

1. Đọc tất cả row `enabled = true` từ `reward_tier`, `reward_prize`, `reward_task`.
2. Ghép prize vào tier theo `tier_id`.
3. Gọi Nakama `reward_config_validate_v1` kiểm tra hợp lệ.
4. Nếu hợp lệ, gọi `reward_config_publish_v1` để áp dụng.
5. Lưu metadata release vào `reward_config_release`.

### Quan trọng

- **Chưa publish = chưa có hiệu lực.** Dữ liệu mới chỉ nằm trong FastSchema.
- **Mỗi lần publish tạo version mới.** Version cũ vẫn lưu để rollback.
- **Publish đọc tối đa 1000 row** mỗi schema. Nếu vượt 1000 giải, cần nâng limit.

---

## 7. Rollback cấu hình

Tại trang `/dashboard/rewards/publish`, chọn release cũ rồi bấm **Rollback**.

Rollback sẽ:

- Chuyển release mục tiêu thành `active`.
- Chuyển release hiện tại thành `retired`.
- Gọi Nakama `reward_config_rollback_v1` khôi phục cấu hình cũ.

---

## 8. Checklist trước khi Publish

- [ ] Mỗi `prize.tier_id` trùng với một `tier.tier_id` đang `enabled`.
- [ ] Mỗi `prize_id` là duy nhất trong toàn bộ bảng.
- [ ] `weight > 0` cho mọi giải muốn phát.
- [ ] `schedule_start < schedule_end` nếu dùng khung giờ.
- [ ] Tổng weight hợp lý: giải hiếm có weight nhỏ, giải phổ biến có weight lớn.
- [ ] `enabled = true` cho tier và prize muốn publish.
- [ ] Test trên môi trường staging trước khi publish production.

---

## 9. Ví dụ cấu hình hoàn chỉnh

### Tier: Quay miễn phí hằng ngày

```
tier_id:       daily
tier_name:     Quay miễn phí
cost_per_spin: 0
max_spins:     1
period:        daily
allowed_days:  [1,2,3,4,5,6,7]
enabled:       true
sort_order:    1
```

### Prize trong tier `daily`

| prize_id | name | points | weight | schedule |
|---|---|---:|---:|---|
| `pts-50` | 50 Điểm | 50 | 4000 | (trống) |
| `pts-100` | 100 Điểm | 100 | 3000 | (trống) |
| `card-20k` | Thẻ cào 20k | 0 | 1500 | (trống) |
| `pts-30` | 30 Điểm | 30 | 1000 | (trống) |
| `card-50k` | Thẻ cào 50k | 0 | 400 | (trống) |
| `card-100k` | Thẻ cào 100k | 0 | 100 | (trống) |
| `ebike` | Xe đạp điện | 0 | 50 | 18:00–21:00 |
| `iphone` | iPhone 17 Pro Max | 0 | 10 | 19:00–22:00 |

Tổng weight = 10060. Xác suất xe đạp điện ≈ 0.5%, iPhone ≈ 0.1%.
