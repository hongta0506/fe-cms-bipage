# Sprint 10: Tree Views + Role Management

## API Data Analysis

| Schema | Total | Key Relations |
|--------|-------|---------------|
| categories | 605 | parent_id (string → id as string) |
| menu_items | ? | parent_id (int), menu_id (relation) |
| role | 3 | permissions (has_many), users (has_many) |
| permission | 24 | role_id (belongs_to role) |
| roles_users | - | pivot: roles(user_id), users(role_id) |

---

## Sprint 10: Tree Views + Role System

### T10.1: TreeView Component
- **Mục tiêu:** Component tree view tái sử dụng
- **Yêu cầu:** Hiển thị hierarchy từ flat list + parent_id
- **Props:** items[], idKey, parentKey, labelKey, renderChildren
- **Files:** `src/components/ui/tree-view.tsx` (NEW)

### T10.2: Categories Tree View
- **Mục tiêu:** Thay table bằng tree view cho categories
- **Yêu cầu:**
  - Tree view hiển thị 605 categories theo hierarchy
  - Expand/collapse nodes
  - Inline edit name, slug
  - Add child category
  - Drag-drop reorder (nice-to-have)
- **Files:** Rewrite `src/app/(main)/dashboard/categories/page.tsx`
- **API:** `parent_id` là string (id dưới dạng string)

### T10.3: Menu Items Tree View
- **Mục tiêu:** Tree view cho menu items trong menus page
- **Yêu cầu:**
  - Tree view hiển thị menu items theo hierarchy
  - Sort order management
  - Add/edit/delete items
  - Link to category slug
- **Files:** Update `src/app/(main)/dashboard/menus/page.tsx`

### T10.4: Role Permission Management
- **Mục tiêu:** Gán permissions cho roles
- **Yêu cầu:**
  - Hiển thị danh sách resources (api.content.*)
  - Toggle allow/deny cho từng resource
  - Bulk assign permissions
  - Permission tree: list/create/update/delete/detail per schema
- **Files:** `src/app/(main)/dashboard/roles/_components/role-permissions.tsx` (NEW)
- **Resources pattern:** `api.content.{schema}.{action}`

### T10.5: User Role Assignment
- **Mục tiêu:** Gán roles cho users
- **Yêu cầu:**
  - Multi-select roles trong user form
  - Hiển thị roles hiện tại
- **Files:** Update `src/app/(main)/dashboard/users/_components/user-form.tsx`

---

## Sprint 11: Remaining Features

### T11.1: Post Tags Multi-Select
- **Mục tiêu:** Chọn nhiều tags trong post form
- **Yêu cầu:** Multi-select hoặc checkbox group từ tags API
- **Files:** Update `src/app/(main)/dashboard/posts/_components/post-form.tsx`

### T11.2: Post Status Workflow
- **Mục tiêu:** Hiển thị published/draft status rõ ràng
- **Yêu cầu:** Badge màu sắc, filter by status
- **Files:** Update `src/app/(main)/dashboard/posts/_components/posts-table.tsx`

### T11.3: Domain Switcher
- **Mục tiêu:** Chuyển đổi giữa domains
- **Yêu cầu:** Dropdown chọn domain, filter content theo domain
- **Files:** `src/components/ui/domain-switcher.tsx` (NEW)

### T11.4: Bulk Actions
- **Mục tiêu:** Chọn nhiều items để xóa/sửa status
- **Yêu cầu:** Checkbox column, bulk delete, bulk status change
- **Files:** Update DataTable component

### T11.5: Import/Export
- **Mục tiêu:** Import CSV/JSON, export data
- **Yêu cầu:** Upload file → parse → bulk create
- **Files:** `src/components/ui/import-export.tsx` (NEW)

### T11.6: Activity Log
- **Mục tiêu:** Hiển thị lịch sử thay đổi
- **Yêu cầu:** Timeline view từ session + post data
- **Files:** `src/app/(main)/dashboard/activity/page.tsx` (NEW)

---

## Priority
1. T10.1 + T10.2 + T10.3 — Tree views (605 categories need this)
2. T10.4 + T10.5 — Role/permission management
3. T11.1 + T11.2 — Post enhancements
4. T11.3-T11.6 — Nice-to-have

## Estimated Effort
- Sprint 10: ~16h
  - T10.1: 2h (tree-view component)
  - T10.2: 3h (categories tree)
  - T10.3: 3h (menu items tree)
  - T10.4: 4h (permission management)
  - T10.5: 2h (user role assignment)
  - Buffer: 2h
- Sprint 11: ~12h
  - T11.1: 2h
  - T11.2: 1.5h
  - T11.3: 2h
  - T11.4: 2.5h
  - T11.5: 2h
  - T11.6: 2h

## Schema Coverage After Sprint 11

| Schema | List | Create | Edit | Delete | Special |
|--------|------|--------|------|--------|---------|
| posts | ✅ | ✅ | ✅ | ✅ | Relations, tags, status |
| categories | ✅✅ | ✅ | ✅ | ✅ | TREE VIEW |
| tags | ✅ | ✅ | ✅ | ✅ | — |
| authors | ✅ | ✅ | ✅ | ✅ | — |
| banners | ✅ | ✅ | ✅ | ✅ | — |
| blocks | ✅ | ✅ | ✅ | ✅ | — |
| menus | ✅ | ✅ | ✅ | ✅ | — |
| menu_items | ✅✅ | ✅ | ✅ | ✅ | TREE VIEW |
| user | ✅ | ✅ | ✅ | ✅ | Roles assignment |
| role | ✅ | ✅ | ✅ | ✅ | Permissions mgmt |
| permission | ✅✅ | ✅ | ✅ | ✅ | Per-role management |
| settings | ✅ | - | ✅ | - | — |
| domains | ✅ | - | - | - | Domain switcher |
| file | ✅ | ✅ | - | - | Upload |
| session | ✅ | - | - | - | — |
| contact_submissions | ✅ | - | - | - | — |
| crawl_sources | ✅ | - | - | - | — |

**All 18 schemas covered.**
