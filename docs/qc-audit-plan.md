# QC Audit Plan — Dashboard Functionality Gap Analysis

## Date: 2026-06-21

---

## Page Status Summary

| Page | CRUD | API | Loading | Missing Features | Priority |
|------|------|-----|---------|------------------|----------|
| posts | ✅ | ✅ | ✅ | Domain filtering cho category dropdown, tags multi-select, domain_id column | **P1** |
| categories | ✅ | ✅ | ✅ | Domain column display, domain filter dropdown | **P1** |
| tags | ✅ | ✅ | ✅ | Domain column, domain filter | **P2** |
| authors | ✅ | ✅ | ✅ | - | - |
| banners | ✅ | ✅ | ✅ | - | - |
| blocks | ✅ | ✅ | ✅ | - | - |
| menus | ✅ | ✅ | ✅ | Tree view domain display | **P2** |
| users | ✅ | ✅ | ✅ | Role assignment, password field | **P1** |
| roles | ✅ | ✅ | ✅ | Permission management UI | **P1** |
| settings | ✅ | ✅ | ✅ | Dialog small, group filter missing | **P2** |
| domains | List only | ✅ | ✅ | CRUD create/edit/delete | **P1** |
| files | Upload | ✅ | ✅ | Bulk delete, grid/list view | **P3** |
| sessions | Read-only | ✅ | ✅ | - | **P3** |
| contact-submissions | List only | ✅ | ✅ | Detail view, status change | **P2** |
| crawl-sources | List only | ✅ | ✅ | CRUD | **P3** |
| profile | Read-only | ✅ | ✅ | Edit form, password change | **P1** |
| calendar | Placeholder | ❌ | ✅ | FullCalendar integration done, needs data | **P4** |
| mail | Placeholder | ❌ | ✅ | - | **P4** |
| chat | Placeholder | ❌ | ✅ | - | **P4** |
| content (dynamic) | ✅ | ✅ | ✅ | - | - |

---

## Sprint 10: Priority Fixes (P1)

### T10.1: Domain Filtering in Post Form
**Problem:** Category dropdown loads ALL 605 categories. Posts have `domain_id`, categories have `domain_id`. Need filter.
**Fix:**
- Add `domain_id` field to post schema/form
- Fetch domains from `GET /api/content/domains`
- Fetch categories filtered by `domain_id` (or client-side filter)
- When user selects domain, filter categories to match
**Files:** `post-form.tsx`

### T10.2: Domain Display in Categories Table
**Problem:** 605 categories span 2 domains (BiPage id=1, BraveTopic id=4). No way to tell which is which.
**Fix:**
- Add `domain_id` column to categories table
- Fetch domains, create lookup map `{ 1: "BiPage", 4: "BraveTopic" }`
- Add domain filter dropdown to DataTable
**Files:** `categories-table.tsx`, `categories/page.tsx`

### T10.3: Domain Display in Tags Table
**Same as T10.2 but for tags.**
**Files:** `tags/` page

### T10.4: Role Permission Management
**Problem:** Roles CRUD exists but no permission assignment UI.
**Fix:**
- Create `role-permissions.tsx` component
- Fetch permissions from `GET /api/content/permission`
- Group by resource: `api.content.{schema}.{action}`
- Toggle allow/deny per resource
- Save via PUT to role with permission IDs
**Files:** `roles/_components/role-permissions.tsx` (NEW), `role-form.tsx`

### T10.5: User Role Assignment
**Problem:** Users CRUD exists but no role assignment.
**Fix:**
- Add role dropdown to user form
- Fetch roles from `GET /api/content/role`
- Save via `roles_users` pivot or user update
**Files:** `user-form.tsx`, `users-table.tsx`

### T10.6: Domains CRUD
**Problem:** Domains page is read-only list. Needs create/edit/delete.
**Fix:**
- Add create/edit/delete dialogs
- Fields: name, slug, hostnames, default_locale, active, status
**Files:** `domains/page.tsx`

---

## Sprint 10: Secondary Fixes (P2)

### T10.7: Settings Dialog Width
**Problem:** SettingEditDialog uses `max-w-sm` (too small).
**Fix:** Change to `max-w-lg` or use `style={{ maxWidth: "800px" }}`.

### T10.8: Contact Submissions Detail
**Problem:** Only list view. No detail view.
**Fix:** Click row → dialog showing full submission data.

### T10.9: Posts Tags Multi-select
**Problem:** Post form has no tags field. Tags are separate.
**Fix:** Add tags multi-select using React Query to fetch tags.

---

## Sprint 10: Low Priority (P3-P4)

- Files: bulk operations, grid view toggle
- Sessions: already functional read-only
- Profile: edit form for current user
- Calendar/Mail/Chat: not in scope (placeholder pages)

---

## Verification Checklist

For each fix, verify:
- [ ] API call succeeds (check Network tab)
- [ ] Data displays correctly in table
- [ ] CRUD operations work (create/read/update/delete)
- [ ] Loading states show during API calls
- [ ] Error states handle failures gracefully
- [ ] Pagination shows correct total from API
- [ ] Filters work correctly
- [ ] Dialog opens at reasonable size
- [ ] Form validation works
- [ ] Dark mode compatible
