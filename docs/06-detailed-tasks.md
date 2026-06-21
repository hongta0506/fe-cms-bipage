# Detailed Task Breakdown — All Sprints

Last updated: 2026-06-21

---

## Sprint 0: Foundation ✅ DONE

| # | Task | Files | Status |
|---|------|-------|--------|
| 0.1 | API client with auth header | `src/lib/api.ts` | ✅ |
| 0.2 | Auth Zustand store + persistence | `src/stores/auth/auth-store.ts` | ✅ |
| 0.3 | AuthProvider | `src/stores/auth/auth-provider.tsx` | ✅ |
| 0.4 | Login form → real API | `src/app/(main)/auth/_components/login-form.tsx` | ✅ |
| 0.5 | Logout in sidebar | `src/app/(main)/dashboard/_components/sidebar/nav-user.tsx` | ✅ |
| 0.6 | Root layout with AuthProvider | `src/app/layout.tsx` | ✅ |

---

## Sprint 1: Dashboard + React Query ✅ DONE

| # | Task | Files | Status |
|---|------|-------|--------|
| 1.1 | Install React Query + Provider | `src/app/layout.tsx` | ✅ |
| 1.2 | Generic CRUD hooks | `src/hooks/use-dashboard.ts` | ✅ |
| 1.3 | MetricCards with real data | `src/app/(main)/dashboard/default/_components/metric-cards.tsx` | ✅ |
| 1.4 | PerformanceOverview chart | `src/app/(main)/dashboard/default/_components/performance-overview.tsx` | ✅ |
| 1.5 | SubscriberOverview chart | `src/app/(main)/dashboard/default/_components/subscriber-overview.tsx` | ✅ |
| 1.6 | Loading skeleton | `src/app/(main)/dashboard/default/loading.tsx` | ✅ |
| 1.7 | Shared components (DataTable, SlugInput) | `src/components/ui/data-table.tsx`, `src/components/ui/slug-input.tsx` | ✅ |

---

## Sprint 2: Posts CRUD ✅ DONE

| # | Task | Files | Status |
|---|------|-------|--------|
| 2.1 | Posts list page | `src/app/(main)/dashboard/posts/page.tsx` | ✅ |
| 2.2 | Posts table | `src/app/(main)/dashboard/posts/_components/posts-table.tsx` | ✅ |
| 2.3 | Post form (create/edit) | `src/app/(main)/dashboard/posts/_components/post-form.tsx` | ✅ |
| 2.4 | Post delete dialog | `src/app/(main)/dashboard/posts/_components/post-delete-dialog.tsx` | ✅ |
| 2.5 | Sidebar nav update | `src/navigation/sidebar/sidebar-items.ts` | ✅ |

---

## Sprint 3: Categories + Tags ✅ DONE

| # | Task | Files | Status |
|---|------|-------|--------|
| 3.1 | Categories CRUD | `src/app/(main)/dashboard/categories/` | ✅ |
| 3.2 | Tags CRUD | `src/app/(main)/dashboard/tags/` | ✅ |
| 3.3 | Removed Pages/Products (no API schema) | — | ✅ |

---

## Sprint 4: Authors + Banners + Blocks ✅ DONE

| # | Task | Files | Status |
|---|------|-------|--------|
| 4.1 | Authors CRUD | `src/app/(main)/dashboard/authors/` | ✅ |
| 4.2 | Banners CRUD | `src/app/(main)/dashboard/banners/` | ✅ |
| 4.3 | Blocks CRUD | `src/app/(main)/dashboard/blocks/` | ✅ |

---

## Sprint 5: Menus + Menu Items ✅ DONE

| # | Task | Files | Status |
|---|------|-------|--------|
| 5.1 | Menus CRUD | `src/app/(main)/dashboard/menus/` | ✅ |
| 5.2 | Menu Items CRUD | `src/app/(main)/dashboard/menus/_components/menu-items-table.tsx` | ✅ |
| 5.3 | Combined page with both tables | `src/app/(main)/dashboard/menus/page.tsx` | ✅ |

---

## Sprint 6: System Pages ✅ DONE

| # | Task | Files | Status |
|---|------|-------|--------|
| 6.1 | Users CRUD (schema: "user") | `src/app/(main)/dashboard/users/` | ✅ |
| 6.2 | Roles CRUD (schema: "role") | `src/app/(main)/dashboard/roles/` | ✅ |
| 6.3 | Settings list | `src/app/(main)/dashboard/settings/page.tsx` | ✅ |
| 6.4 | Domains list | `src/app/(main)/dashboard/domains/page.tsx` | ✅ |
| 6.5 | Files list | `src/app/(main)/dashboard/files/page.tsx` | ✅ |
| 6.6 | Sessions list | `src/app/(main)/dashboard/sessions/page.tsx` | ✅ |
| 6.7 | Contact Submissions list | `src/app/(main)/dashboard/contact-submissions/page.tsx` | ✅ |
| 6.8 | Crawl Sources list | `src/app/(main)/dashboard/crawl-sources/page.tsx` | ✅ |
| 6.9 | Auth middleware | `src/middleware.ts` | ✅ |
| 6.10 | Dashboard redirect | `src/app/(main)/dashboard/page.tsx` | ✅ |
| 6.11 | Legacy template pages cleanup | — | ✅ |

---

## Sprint 7: Polish (REMAINING)

| # | Task | Description | Priority | Status |
|---|------|-------------|----------|--------|
| 7.1 | RichTextEditor for Posts | Integrate WYSIWYG for post content field | High | ⏳ |
| 7.2 | ImagePicker component | Reusable file picker dialog for forms | High | ⏳ |
| 7.3 | Post form relations | Wire author_id, category_id, tags in post form | High | ⏳ |
| 7.4 | Settings form | Edit key/value pairs (currently read-only) | Medium | ⏳ |
| 7.5 | Skeleton loaders | Add loading.tsx to all routes | Medium | ⏳ |
| 7.6 | Error boundary | Dashboard error.tsx for graceful errors | Medium | ⏳ |
| 7.7 | Responsive pass | Mobile sidebar, responsive tables | Medium | ⏳ |
| 7.8 | Profile page | Edit current user profile | Low | ⏳ |
| 7.9 | File upload | Drag-and-drop upload to files page | Low | ⏳ |

---

## Schema Coverage

| Schema | List | Create | Edit | Delete | Notes |
|--------|------|--------|------|--------|-------|
| posts | ✅ | ✅ | ✅ | ✅ | 4238 items |
| categories | ✅ | ✅ | ✅ | ✅ | Tree structure |
| tags | ✅ | ✅ | ✅ | ✅ | Simple |
| authors | ✅ | ✅ | ✅ | ✅ | — |
| banners | ✅ | ✅ | ✅ | ✅ | — |
| blocks | ✅ | ✅ | ✅ | ✅ | — |
| menus | ✅ | ✅ | ✅ | ✅ | — |
| menu_items | ✅ | ✅ | ✅ | ✅ | — |
| user | ✅ | ✅ | ✅ | ✅ | — |
| role | ✅ | ✅ | ✅ | ✅ | — |
| settings | ✅ | - | - | - | Read-only |
| domains | ✅ | - | - | - | Read-only |
| file | ✅ | - | - | - | Read-only |
| session | ✅ | - | - | - | Read-only |
| contact_submissions | ✅ | - | - | - | Read-only |
| crawl_sources | ✅ | - | - | - | Read-only |

**Build:** 31 pages, 0 TS errors ✅
