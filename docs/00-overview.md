# Bipage Admin Dashboard — Project Overview

## Tech Stack
- **Frontend:** Next.js 16 (App Router) + React 19 + TypeScript
- **UI:** shadcn/ui v4 (radix-nova style) + Tailwind CSS v4 + Lucide icons
- **State:** Zustand (client-side), cookies (server-side sidebar prefs)
- **Forms:** react-hook-form + zod
- **Charts:** recharts
- **Tables:** @tanstack/react-table
- **Data:** @tanstack/react-query v5
- **Linting:** Biome (not ESLint)

## Backend
- **CMS:** FastSchema at `https://api.bipage.net`
- **Auth:** JWT via `POST /api/auth/local/login`
- **Content CRUD:** `GET/POST/PUT/DELETE /api/content/{schema}`
- **Schema discovery:** `GET /api/schema`

## FastSchema Content Schemas (Real API — 18 schemas)

| Schema | Label | Purpose | CRUD Page |
|--------|-------|---------|-----------|
| `posts` | Posts | Blog/news articles | /dashboard/posts ✅ |
| `categories` | Categories | Content categories | /dashboard/categories ✅ |
| `tags` | Tags | Content tags | /dashboard/tags ✅ |
| `authors` | Authors | Content authors | /dashboard/authors ✅ |
| `banners` | Banners | Homepage banners | /dashboard/banners ✅ |
| `blocks` | Blocks | CMS blocks | /dashboard/blocks ✅ |
| `menus` | Menus | Navigation menus | /dashboard/menus ✅ |
| `menu_items` | Menu Items | Menu entries | /dashboard/menus ✅ |
| `user` | User | System users | /dashboard/users ✅ |
| `role` | Role | System roles | /dashboard/roles ✅ |
| `settings` | Settings | Site settings (k/v) | /dashboard/settings ✅ |
| `domains` | Domains | Domain config | /dashboard/domains ✅ |
| `file` | File | Uploaded files | /dashboard/files ✅ |
| `session` | Session | User sessions | /dashboard/sessions ✅ |
| `contact_submissions` | Contacts | Contact form submissions | /dashboard/contact-submissions ✅ |
| `crawl_sources` | Crawl Sources | Crawler config | /dashboard/crawl-sources ✅ |
| `permission` | Permission | Permissions | (via roles) |
| `roles_users` | Roles-Users | Role-user relation | (via users) |
| `post_views` | Post Views | View counter (read-only) | — |

**NOT in API:** pages, products, orders, comments, order_items

## Current Stats (from API)
- 18 schemas
- 1 user (admin)
- 3 roles
- 578 files
- 4238 posts

## Project Structure
```
src/
├── app/
│   ├── (main)/
│   │   ├── auth/           — Login/register
│   │   ├── dashboard/      — All dashboard pages
│   │   │   ├── _components/ — Sidebar, header, shared
│   │   │   ├── default/    — Default dashboard (stats)
│   │   │   ├── posts/      — Posts CRUD
│   │   │   ├── categories/ — Categories CRUD
│   │   │   ├── tags/       — Tags CRUD
│   │   │   ├── authors/    — Authors CRUD
│   │   │   ├── banners/    — Banners CRUD
│   │   │   ├── blocks/     — Blocks CRUD
│   │   │   ├── menus/      — Menus + Menu Items CRUD
│   │   │   ├── users/      — Users CRUD
│   │   │   ├── roles/      — Roles CRUD
│   │   │   ├── settings/   — Settings list
│   │   │   ├── domains/    — Domains list
│   │   │   ├── files/      — Files list
│   │   │   ├── sessions/   — Sessions list
│   │   │   ├── contact-submissions/ — Contacts list
│   │   │   ├── crawl-sources/ — Crawl sources list
│   │   │   ├── mail/       — Mail page
│   │   │   ├── chat/       — Chat page
│   │   │   └── calendar/   — Calendar page
│   │   └── ...
│   └── ...
├── components/ui/          — shadcn components
├── hooks/                  — use-dashboard.ts (CRUD hooks)
├── lib/                    — api.ts (API client)
├── navigation/             — sidebar-items.ts
├── stores/auth/            — auth-store.ts (Zustand)
└── middleware.ts           — Auth middleware
```
