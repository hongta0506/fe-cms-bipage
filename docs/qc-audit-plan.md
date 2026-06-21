# QC Audit Plan — Dashboard CRUD & Permissions

**Date:** 2026-06-21  
**Goal:** Systematically test every page for CRUD operations, data loading, and UI completeness.

---

## 1. Schema Inventory (18 total)

| Schema | Page | List | Create | Edit | Delete | Hook | Notes |
|--------|------|------|--------|------|--------|------|-------|
| authors | /authors | ✅ | ✅ | ✅ | ✅ | useContentAll | Full CRUD |
| banners | /banners | ✅ | ? | ? | ? | useContent | Domain-scoped |
| blocks | /blocks | ✅ | ? | ? | ? | useContent | Domain-scoped |
| categories | /categories | ✅ tree | ? | ? | ? | useContentAll | Tree view, parent_id |
| contact_submissions | /contact-submissions | ✅ list | ❌ | ❌ | ❌ | useContentAll | Read-only |
| crawl_sources | /crawl-sources | ✅ list | ❌ | ❌ | ❌ | useContentAll | Read-only |
| domains | /domains | ✅ list | ❌ | ❌ | ❌ | useContentAll | Read-only |
| file | /files | ✅ list | ✅ upload | ❌ | ❌ | useContentAll | Upload only |
| menu_items | /menus → items | ✅ tree | ? | ? | ? | useContentAll | Tree view |
| menus | /menus | ✅ | ? | ? | ? | useContentAll | Domain-scoped |
| permission | ❌ | ❌ | ❌ | ❌ | ❌ | — | NO PAGE |
| post_views | ❌ | ❌ | ❌ | ❌ | ❌ | — | NO PAGE (analytics) |
| posts | /posts | ✅ | ✅ | ✅ | ✅ | useContent | Domain-scoped |
| roles | /roles | ✅ | ✅ | ✅ | ✅ | useContentAll | Full CRUD |
| roles_users | ❌ | ❌ | ❌ | ❌ | ❌ | — | Join table |
| settings | /settings | ✅ | ❌ | ✅ | ❌ | useContentAll | Edit only |
| tags | /tags | ✅ | ✅ | ✅ | ✅ | useContentAll | Full CRUD |
| user | /users | ✅ | ✅ | ✅ | ✅ | useContentAll | Full CRUD |

---

## 2. Page-by-Page Audit

### 2.1 Posts (`/posts`)
- **API:** `posts` — 33 fields, domain-scoped
- **CRUD:** Create ✅, Edit ✅, Delete ✅, List ✅
- **Missing:** Domain column in table, tags multi-select, category domain filter
- **Status:** Functional, needs enhancements

### 2.2 Categories (`/categories`)
- **API:** `categories` — 14 fields, tree (parent_id), domain-scoped
- **CRUD:** Tree view ✅, edit/delete ? (need to check)
- **Missing:** Domain column display, domain filter dropdown
- **Status:** Tree view loads all items, needs CRUD buttons

### 2.2a Categories Form — parent_id UX Issue
- **Problem:** Edit form shows raw `parent_id` number, user can't tell which parent it is
- **Fix:** Show parent name text (e.g., select dropdown with category names), not raw ID
- **Affects:** CategoryFormDialog, MenuItemFormDialog (both have parent_id)

### 2.3 Tags (`/tags`)
- **API:** `tags` — 8 fields, global
- **CRUD:** Create ✅, Edit ✅, Delete ✅, List ✅
- **Missing:** Domain column, domain filter
- **Status:** Full CRUD working

### 2.4 Authors (`/authors`)
- **API:** `authors` — 8 fields, global
- **CRUD:** Create ✅, Edit ✅, Delete ✅, List ✅
- **Missing:** — 
- **Status:** Full CRUD working

### 2.5 Banners (`/banners`)
- **API:** `banners` — 15 fields, domain-scoped, position enum, locale
- **CRUD:** List ✅, Create ✅, Edit ✅, Delete ✅
- **Form:** BannerFormDialog + BannerDeleteDialog exist
- **Hook:** useContent (domain-scoped)
- **Status:** Full CRUD working

### 2.6 Blocks (`/blocks`)
- **API:** `blocks` — 15 fields, domain-scoped, type enum (text/html/cta), locale
- **CRUD:** List ✅, Create ✅, Edit ✅, Delete ✅
- **Form:** BlockFormDialog + BlockDeleteDialog exist
- **Hook:** useContent (domain-scoped)
- **Status:** Full CRUD working

### 2.7 Menus (`/menus`)
- **API:** `menus` — 12 fields, domain-scoped, location enum
- **CRUD:** List ✅ (tree for items), Create ✅, Edit ✅, Delete ✅
- **Form:** MenuFormDialog, MenuItemFormDialog, MenuDeleteDialog, MenuItemDeleteDialog exist
- **Hook:** useContentAll
- **Status:** Full CRUD for both menus and menu items, tree view

### 2.8 Users (`/users`)
- **API:** `user` — 16 fields, global, all SYSTEM
- **CRUD:** Create ✅, Edit ✅, Delete ✅, List ✅
- **Missing:** Role assignment in form
- **Status:** Full CRUD, needs role picker

### 2.9 Roles (`/roles`)
- **API:** `role` — 10 fields, global, all SYSTEM
- **CRUD:** Create ✅, Edit ✅, Delete ✅, List ✅
- **Missing:** Permission management UI
- **Status:** Full CRUD, no permission assignment

### 2.10 Settings (`/settings`)
- **API:** `settings` — 11 fields, domain-scoped, group enum (site/footer/social/seo)
- **CRUD:** List ✅, Edit ✅ (dialog)
- **Missing:** Create/Delete, group filter dropdown
- **Status:** Edit only

### 2.11 Domains (`/domains`)
- **API:** `domains` — 18 fields, global
- **CRUD:** List ✅, Create ✅, Edit ✅, Delete ✅
- **Form:** DomainFormDialog + DomainDeleteDialog
- **Status:** Full CRUD ✅ (Sprint 14)

### 2.12 Files (`/files`)
- **API:** `file` — 11 fields (all SYSTEM)
- **CRUD:** List ✅, Upload ✅
- **Missing:** Delete, bulk operations, grid view
- **Status:** Upload only

### 2.13 Sessions (`/sessions`)
- **API:** `session` — 10 fields (all SYSTEM), read-only
- **CRUD:** List ✅ only
- **Missing:** — (read-only by design)
- **Status:** Read-only

### 2.14 Contact Submissions (`/contact-submissions`)
- **API:** `contact_submissions` — 13 fields
- **CRUD:** List ✅ only
- **Missing:** Detail view, status change, delete
- **Status:** Read-only

### 2.15 Crawl Sources (`/crawl-sources`)
- **API:** `crawl_sources` — 30 fields, complex config
- **CRUD:** List ✅ only
- **Missing:** Full CRUD (30 fields = complex form)
- **Status:** Read-only, P3 priority

---

## 3. Missing Pages

| Schema | Purpose | Priority | Action |
|--------|---------|----------|--------|
| permission | Role permissions CRUD | P1 | Create page with permission matrix |
| post_views | Analytics data | P3 | Read-only list or skip (data is append-only) |
| roles_users | Join table | — | Managed via role edit (m2m) |

---

## 4. Sprint Plan

### Sprint 13: Fix Data Loading + CRUD Audit (Current)
- [x] System tables → useContentAll (no domain filter)
- [ ] Audit each page for CRUD completeness
- [ ] Add missing Edit/Delete icons
- [ ] Test each page end-to-end

### Sprint 14: UX Fixes + Missing CRUD
- [ ] **Categories/Menus parent_id:** Show parent name text, not raw ID number in edit forms
- [ ] Domains: Full CRUD (create/edit/delete)
- [ ] Crawl Sources: Full CRUD form
- [ ] Contact Submissions: Detail view + status change
- [ ] Settings: Add Create/Delete + group filter dropdown
- [ ] Files: Add Delete action

### Sprint 15: Advanced Features
- [ ] Permission management page
- [ ] Role-permission assignment UI
- [ ] User role assignment in form
- [ ] Post_views: Analytics read-only page (optional)

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
