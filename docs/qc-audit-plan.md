# QC Audit Plan — Dashboard CRUD & Permissions

**Date:** 2026-06-22  
**Goal:** Systematically test every page for CRUD operations, data loading, and UI completeness.

---

## 1. Schema Inventory (18 total)

| Schema | Page | List | Create | Edit | Delete | Hook | Search | Notes |
|--------|------|------|--------|------|--------|------|--------|-------|
| authors | /authors | ✅ | ✅ | ✅ | ✅ | useContentAll | ✅ server | Full CRUD |
| banners | /banners | ✅ | ✅ | ✅ | ✅ | useContent | ✅ server | Full CRUD, domain-scoped |
| blocks | /blocks | ✅ | ✅ | ✅ | ✅ | useContent | ✅ server | Full CRUD, domain-scoped |
| categories | /categories | ✅ tree | ✅ | ✅ | ✅ | useContentAll | ✅ server | Tree view, parent_id |
| contact_submissions | /contact-submissions | ✅ list | ❌ | ❌ | ✅ delete | useContentAll | ✅ server | Detail + status change |
| crawl_sources | /crawl-sources | ✅ list | ✅ | ✅ | ✅ | useContentAll | ✅ server | Full CRUD |
| domains | /domains | ✅ list | ✅ | ✅ | ✅ | useContentAll | ✅ server | Full CRUD |
| file | /files | ✅ list | ✅ upload | ❌ | ✅ delete | useContentAll | ✅ server | Upload + delete |
| menu_items | /menus → items | ✅ tree | ✅ | ✅ | ✅ | useContentAll | ✅ server | Tree view, parent_id dropdown |
| menus | /menus | ✅ | ✅ | ✅ | ✅ | useContentAll | ✅ server | Full CRUD, domain-scoped |
| permission | ❌ | ❌ | ❌ | ❌ | ❌ | — | — | Auto-managed by BAAS |
| post_views | ❌ | ❌ | ❌ | ❌ | ❌ | — | — | NO PAGE (analytics) |
| posts | /posts | ✅ | ✅ | ✅ | ✅ | useContent | ✅ server | Full CRUD, domain-scoped |
| roles | /roles | ✅ | ✅ | ✅ | ✅ | useContentAll | ✅ server | Full CRUD |
| roles_users | ❌ | ❌ | ❌ | ❌ | ❌ | — | — | Auto-managed by BAAS |
| settings | /settings | ✅ | ❌ | ✅ | ✅ delete | useContentAll | ✅ server | Edit + delete + group filter |
| tags | /tags | ✅ | ✅ | ✅ | ✅ | useContentAll | ✅ server | Full CRUD |
| user | /users | ✅ | ✅ | ✅ | ✅ | useContentAll | ✅ server | Full CRUD + role assignment |

---

## 2. Page-by-Page Audit

### 2.1 Posts (`/posts`)
- **API:** `posts` — 33 fields, domain-scoped
- **CRUD:** Create ✅, Edit ✅, Delete ✅, List ✅
- **Search:** Server-side via API
- **Status:** Full CRUD working

### 2.2 Categories (`/categories`)
- **API:** `categories` — 14 fields, tree (parent_id), domain-scoped
- **CRUD:** Tree view ✅, Create ✅, Edit ✅, Delete ✅
- **Search:** Server-side via API
- **Status:** Full CRUD working

### 2.3 Tags (`/tags`)
- **API:** `tags` — 8 fields, global
- **CRUD:** Create ✅, Edit ✅, Delete ✅, List ✅
- **Search:** Server-side via API
- **Status:** Full CRUD working

### 2.4 Authors (`/authors`)
- **API:** `authors` — 8 fields, global
- **CRUD:** Create ✅, Edit ✅, Delete ✅, List ✅
- **Search:** Server-side via API
- **Status:** Full CRUD working

### 2.5 Banners (`/banners`)
- **API:** `banners` — 15 fields, domain-scoped, position enum, locale
- **CRUD:** Create ✅, Edit ✅, Delete ✅, List ✅
- **Search:** Server-side via API
- **Status:** Full CRUD working

### 2.6 Blocks (`/blocks`)
- **API:** `blocks` — 15 fields, domain-scoped, type enum (text/html/cta), locale
- **CRUD:** Create ✅, Edit ✅, Delete ✅, List ✅
- **Search:** Server-side via API
- **Status:** Full CRUD working

### 2.7 Menus (`/menus`)
- **API:** `menus` — 12 fields, domain-scoped, location enum
- **CRUD:** Create ✅, Edit ✅, Delete ✅, List ✅ (tree for items)
- **Search:** Server-side via API
- **Status:** Full CRUD for both menus and menu items, tree view

### 2.8 Users (`/users`)
- **API:** `user` — 16 fields, global, all SYSTEM
- **CRUD:** Create ✅, Edit ✅, Delete ✅, List ✅
- **Roles:** Role multi-select in form (m2m via roles_users)
- **Search:** Server-side via API
- **Status:** Full CRUD + role assignment

### 2.9 Roles (`/roles`)
- **API:** `role` — 10 fields, global, all SYSTEM
- **CRUD:** Create ✅, Edit ✅, Delete ✅, List ✅
- **Search:** Server-side via API
- **Status:** Full CRUD working

### 2.10 Settings (`/settings`)
- **API:** `settings` — 11 fields, domain-scoped, group enum (site/footer/social/seo)
- **CRUD:** Edit ✅, Delete ✅, List ✅
- **Filters:** Group filter dropdown ✅
- **Search:** Server-side via API
- **Status:** Full CRUD working

### 2.11 Domains (`/domains`)
- **API:** `domains` — 18 fields, global
- **CRUD:** Create ✅, Edit ✅, Delete ✅, List ✅
- **Search:** Server-side via API
- **Status:** Full CRUD working

### 2.12 Files (`/files`)
- **API:** `file` — 11 fields (all SYSTEM)
- **CRUD:** Upload ✅, Delete ✅, List ✅
- **Search:** Server-side via API
- **Status:** CRUD working

### 2.13 Sessions (`/sessions`)
- **API:** `session` — 10 fields (all SYSTEM), read-only
- **CRUD:** List ✅ only
- **Search:** Server-side via API
- **Status:** Read-only by design

### 2.14 Contact Submissions (`/contact-submissions`)
- **API:** `contact_submissions` — 13 fields
- **CRUD:** Detail ✅, Status change ✅, Delete ✅, List ✅
- **Search:** Server-side via API
- **Status:** Full CRUD working

### 2.15 Crawl Sources (`/crawl-sources`)
- **API:** `crawl_sources` — 30 fields, complex config
- **CRUD:** Create ✅, Edit ✅, Delete ✅, List ✅
- **Form:** 30 fields with CSS selectors, schedule, custom config
- **Search:** Server-side via API
- **Status:** Full CRUD working

---

## 3. Missing Pages

| Schema | Purpose | Priority | Action |
|--------|---------|----------|--------|
| permission | Auto-generated by BAAS | — | No page needed |
| post_views | Analytics data | P3 | Read-only list or skip (data is append-only) |
| roles_users | Join table | — | Auto-managed by BAAS |

---

## 4. Sprint Plan

### Sprint 13: Fix Data Loading + CRUD Audit (Current)
- [x] System tables → useContentAll (no domain filter)
- [ ] Audit each page for CRUD completeness
- [ ] Add missing Edit/Delete icons
- [ ] Test each page end-to-end

### Sprint 14: UX Fixes + Missing CRUD
- [x] **Categories/Menus parent_id:** Show parent name text, not raw ID number in edit forms
- [x] Domains: Full CRUD (create/edit/delete)
- [x] Crawl Sources: Full CRUD form (30 fields)
- [x] Contact Submissions: Detail view + status change + delete
- [x] Settings: Delete + group filter dropdown
- [x] Files: Delete action

### Sprint 15: User Roles + QC
- [ ] User form: Add role picker (m2m via roles_users) — API schema confirms `user.roles` m2m relation
- [ ] Roles page: Show assigned users count (optional)
- [ ] QC: Test each page end-to-end per checklist below

> **Schema API findings (`/api/schema`):**
> - 3 built-in roles: Admin (root), User, Guest
> - `permission` schema: resource/value/modifier — auto-managed by BAAS, no CRUD UI
> - `roles_users`: junction table (`is_junction_schema: true`), auto-managed
> - `user` → `roles`: m2m via junction table `roles_users`

---

## 5. Testing Checklist

For each page, test:
- [ ] Page loads without errors
- [ ] Data renders in table
- [ ] Search/filter works
- [ ] Pagination works (items per page, page navigation)
- [ ] Create form opens and submits
- [ ] Edit form opens with pre-filled data
- [ ] Delete confirmation works
- [ ] No console errors
- [ ] Responsive on mobile
