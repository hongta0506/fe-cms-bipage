# Sprint 16: Role Permission Management

**Date:** 2026-06-22
**Branch:** `feat/role-permissions`
**Status:** IN PROGRESS — Implementation done, pending manual testing

---

## Context

Roles CRUD exists (`/dashboard/roles`) with list/create/edit/delete. User role assignment done in user form (m2m via `role_ids`). But **no permission management UI** — planned as T10.4 in Sprint 10, never built.

FastSchema auto-generates 24 permission records across 13 resource groups. Admin currently has no way to view or assign permissions to roles from the dashboard.

---

## Permission Structure (from API)

```
auth:           me, logout, token/refresh, local.login/register/activate/recover
schema:         list, create, detail, update, delete, import, export
realtime:       content (subscribe)
role:           list, detail, create, update, delete
file:           upload, delete
tool:           stats
config:         (all)
content.{n}:    list, detail, create, bulk-update, update, bulk-delete, delete
  ├── crawl_sources, menu_items, post_views, settings, banners,
  │   categories, contact_submissions, blocks, tags, menus,
  │   file, posts, authors, domains, session
realtime.content.{n}:  *, create, update, delete
  └── (same schemas as content)
docs:           spec, viewer
```

**Permission fields:** `resource` (string path), `value` (string, always "allow"), `role_id` (FK)

**Actual API findings (2026-06-22):**
- Role detail endpoint `/api/content/role/{id}` does NOT return permissions relation
- Permissions must be fetched separately: `GET /api/content/permission?filter={"role_id": X}`
- Permission CRUD supported: `POST /api/content/permission` (create), `DELETE /api/content/permission/{id}` (delete)
- 16 existing permission records, all assigned to Guest (role_id=3)
- Admin and User have 0 permissions

---

## Approach: Tab in RoleFormDialog

Add a **"Permissions" tab** inside the existing edit dialog. No new page — permissions are per-role, so managing them inside the role context makes sense.

### UI Design

```
┌─ Edit Role ──────────────────────────────────────┐
│ [Basic Info]  [Permissions]  ← tabs              │
│                                                   │
│ Permissions tab:                                  │
│ ┌─────────────────────────────────────────────┐   │
│ │ ▼ Auth                           [All] [None]│  │
│ │   ☑ api.auth.me                              │  │
│ │   ☑ api.auth.logout                          │  │
│ │   ☑ api.auth.token/refresh                   │  │
│ │   ☑ api.auth.local.login                     │  │
│ │   ☑ api.auth.local.register                  │  │
│ │   ☑ api.auth.local.activate                  │  │
│ │   ☑ api.auth.local.recover                   │  │
│ ├─────────────────────────────────────────────┤   │
│ │ ▼ Content - Posts               [All] [None] │  │
│ │   ☑ api.content.posts.list                   │  │
│ │   ☑ api.content.posts.detail                 │  │
│ │   ☑ api.content.posts.create                 │  │
│ │   ☑ api.content.posts.update                 │  │
│ │   ☑ api.content.posts.delete                 │  │
│ │   ☑ api.content.posts.bulk-update            │  │
│ │   ☑ api.content.posts.bulk-delete            │  │
│ ├─────────────────────────────────────────────┤   │
│ │ ... (all 13 resource groups)                 │  │
│ └─────────────────────────────────────────────┘   │
│                                                   │
│                              [Cancel] [Save]      │
└───────────────────────────────────────────────────┘
```

---

## Files Changed

| # | File | Action | Description |
|---|------|--------|-------------|
| 1 | `src/app/(main)/dashboard/roles/_components/role-form.tsx` | MODIFY | Add Tabs (Basic Info / Permissions), fetch role permissions via `api.getContent("permission", {filter: {role_id}})`, create/delete permission records on save |
| 2 | `src/app/(main)/dashboard/roles/_components/role-permissions.tsx` | NEW | Static permission tree — 24 resource groups, collapsible sections, checkbox per resource, group select all |
| 3 | `docs/sprint-16-role-permissions.md` | NEW | This plan |

### API approach (different from original plan)
- **No** `useContentAll("permission")` — role detail doesn't include permissions
- Use `api.getContent("permission", { filter: JSON.stringify({ role_id: X }) })` to fetch role's permissions
- On save: `api.createContent("permission", { role_id, resource, value: "allow" })` for added, `api.deleteContent("permission", id)` for removed

---

## Implementation Steps

1. ✅ **Create `role-permissions.tsx`** — static resource tree, collapsible groups, checkbox per resource
2. ✅ **Modify `role-form.tsx`** — Tabs UI, fetch role permissions, create/delete on save
3. ✅ **`npx tsc --noEmit`** — PASS
4. ✅ **`npx next build`** — PASS
5. ⬜ **Manual test** — edit role → toggle permissions → save → reload → verify
6. ⬜ **Git** — branch, commit, push, PR

---

## Verification

- [ ] `npx tsc --noEmit` passes
- [ ] `npx next build` passes
- [ ] Permission tree loads for each role
- [ ] Check/uncheck individual permissions
- [ ] Select All / None per group works
- [ ] Save persists to API
- [ ] Reload shows saved state

---

## Out of Scope

- Creating/deleting permissions (FastSchema auto-manages these)
- Wildcard permission assignment (e.g., `api.realtime.content.posts.*` is pre-defined)
- Permission page at `/dashboard/permissions` (permissions are per-role, not standalone)
