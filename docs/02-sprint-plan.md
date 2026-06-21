# Sprint Plan — Bipage Admin Dashboard Rebuild (v3)

## Vision
Rebuild admin dashboard from UI-only template → full FastSchema CMS admin panel. All screens show real data, full CRUD, proper auth flow.

## Schema Coverage (Real API schemas)

| Schema | Page | List | Create | Edit | Delete | Notes |
|--------|------|------|--------|------|--------|-------|
| posts | /dashboard/posts | ✅ | ✅ | ✅ | ✅ | 4238 items, relations (author, category, tags) |
| categories | /dashboard/categories | ✅ | ✅ | ✅ | ✅ | Tree structure (parent_id) |
| tags | /dashboard/tags | ✅ | ✅ | ✅ | ✅ | Simple name/slug |
| authors | /dashboard/authors | ✅ | ✅ | ✅ | ✅ | username, display_name |
| banners | /dashboard/banners | ✅ | ✅ | ✅ | ✅ | title, image, link_url, position, sort_order |
| blocks | /dashboard/blocks | ✅ | ✅ | ✅ | ✅ | key, title, type, content, link_url |
| menus | /dashboard/menus | ✅ | ✅ | ✅ | ✅ | key, label, location, locale |
| menu_items | /dashboard/menus | ✅ | ✅ | ✅ | ✅ | label, url, sort_order, parent_id, menu_id |
| user | /dashboard/users | ✅ | ✅ | ✅ | ✅ | username, email, first/last_name, active |
| role | /dashboard/roles | ✅ | ✅ | ✅ | ✅ | name, description, root |
| settings | /dashboard/settings | ✅ | - | - | - | key/value pairs, grouped |
| domains | /dashboard/domains | ✅ | - | - | - | slug, name, hostnames |
| file | /dashboard/files | ✅ | - | - | - | disk, name, path, type, size |
| session | /dashboard/sessions | ✅ | - | - | - | user_id, ip, device, status |
| contact_submissions | /dashboard/contact-submissions | ✅ | - | - | - | name, email, message |
| crawl_sources | /dashboard/crawl-sources | ✅ | - | - | - | name, base_url, enabled |

**Not in API:** pages, products, orders, comments, post_views (read-only view counter)

## Shared Components ✅ DONE

| Component | File | Status |
|-----------|------|--------|
| DataTable | src/components/ui/data-table.tsx | ✅ |
| SlugInput | src/components/ui/slug-input.tsx | ✅ |
| Auth Store | src/stores/auth/auth-store.ts | ✅ |
| API Client | src/lib/api.ts | ✅ |
| Data Hooks | src/hooks/use-dashboard.ts | ✅ |
| Auth Middleware | src/middleware.ts | ✅ |

---

## Sprint 0-2: Foundation + Auth + Dashboard + Posts ✅ DONE
- Auth flow, JWT token, login page
- Default dashboard with metric cards
- DataTable, SlugInput, mutation hooks
- Posts CRUD (4238 items confirmed)

## Sprint 3-4: Taxonomy + Content ✅ DONE
- Categories CRUD (tree structure with parent_id)
- Tags CRUD (simple name/slug)
- Authors CRUD (username, display_name)
- Removed Pages/Products (schemas don't exist in API)

## Sprint 5: Media + Banners ✅ DONE
- Banners CRUD (title, image, link_url, position, sort_order, active)
- Files list page (read-only from API)
- Removed legacy template pages (academy, crm, finance, etc.)

## Sprint 6: Blocks ✅ DONE
- Blocks CRUD (key, title, type, content, link_url, active)

## Sprint 7: Navigation — Menus + Menu Items ✅ DONE
- Menus CRUD (key, label, location, locale)
- Menu Items CRUD (label, url, sort_order, parent_id, menu_id)
- Combined page with both tables

## Sprint 8: System Pages ✅ DONE
- Users CRUD (schema: "user" singular)
- Roles CRUD (schema: "role" singular)
- Settings list (key/value pairs)
- Domains list
- Sessions list
- Contact Submissions list
- Crawl Sources list
- Auth middleware protecting /dashboard/* routes

## Sprint 9: Polish (Remaining)
1. **RichTextEditor** — Integrate for Posts content field
2. **ImagePicker** — Reusable file picker dialog for forms
3. **Skeleton loaders** — Loading states for all list pages
4. **Error boundaries** — Graceful error handling
5. **Responsive** — Mobile sidebar, responsive tables
6. **Settings form** — Edit key/value pairs (currently read-only)
7. **Profile page** — Edit current user profile
8. **Post relations** — Wire author_id, category_id, tags in post form
9. **File upload** — Drag-and-drop upload to files page
10. **Menu builder** — Visual drag-drop menu tree (optional)

---

## Summary

| Sprint | Focus | Status |
|--------|-------|--------|
| 0-2 | Foundation, Auth, Posts | ✅ Done |
| 3-4 | Taxonomy (Categories, Tags, Authors) | ✅ Done |
| 5 | Banners, Files, Cleanup | ✅ Done |
| 6 | Blocks | ✅ Done |
| 7 | Menus + Menu Items | ✅ Done |
| 8 | System (Users, Roles, Settings, etc.) | ✅ Done |
| 9 | Polish (RichText, ImagePicker, etc.) | ⏳ Remaining |

**All CRUD pages (16 schemas) built and compiling clean.**
**31 pages generated in production build.**
