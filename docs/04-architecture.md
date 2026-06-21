# Architecture Decisions

## Data Flow

```
User → Page Component → Hook (useSWR/useQuery) → API Client → FastSchema API
                          ↓
                     Zustand Store (auth state)
                          ↓
                     UI Components (shadcn)
```

## File Structure Convention

```
src/app/(main)/dashboard/{feature}/
├── page.tsx                    — Route page (server or client component)
├── [id]/
│   └── page.tsx               — Detail/edit page (if needed)
└── _components/
    ├── {feature}-table.tsx    — DataTable with @tanstack/react-table
    ├── {feature}-form.tsx     — Create/edit form (react-hook-form + zod)
    ├── {feature}-columns.tsx  — Column definitions for table
    └── data.ts                — ONLY if mock data needed during dev
```

## Shared Components

```
src/components/
├── ui/                        — shadcn components (DO NOT modify)
├── content/
│   ├── data-table.tsx         — Reusable table wrapper
│   ├── data-table-pagination.tsx
│   ├── data-table-toolbar.tsx
│   ├── data-table-search.tsx
│   └── empty-state.tsx
├── media/
│   ├── image-picker.tsx       — File picker dialog
│   └── file-upload.tsx        — Upload component
└── forms/
    ├── rich-text-editor.tsx   — If needed for content fields
    └── slug-input.tsx         — Auto-generate slug from title
```

## Hooks Layer

```
src/hooks/
├── use-fast-schema.ts         — Generic CRUD hooks
│   ├── useContentList(schema, options)
│   ├── useContentItem(schema, id)
│   ├── useCreateContent(schema)
│   ├── useUpdateContent(schema)
│   └── useDeleteContent(schema)
├── use-auth.ts                — Auth convenience hooks
│   ├── useUser()
│   └── useRequireAuth()
└── use-debounce.ts            — Search debouncing
```

## State Management

| What | Where | Why |
|------|-------|-----|
| Auth token + user | Zustand + localStorage persist | Survives page refresh |
| Sidebar/theme prefs | Cookies (server action) | SSR-compatible |
| Server data (posts, products...) | React Query / SWR | Cache + revalidation |
| Form state | react-hook-form | Per-form, no global needed |
| UI state (dialogs, drawers) | Component state | Ephemeral |

## Auth Flow

```
1. User submits login form
2. POST /api/auth/local/login → { token }
3. Store token in Zustand (persisted to localStorage)
4. api.setToken(token) → all subsequent requests include Bearer header
5. GET /api/auth/me → store user profile
6. Redirect to /dashboard/default

On refresh:
1. Zustand hydrates token from localStorage
2. AuthProvider.initialize() calls GET /api/auth/me
3. If 401 → clear token, redirect to login
4. If 200 → store user profile, app is authenticated
```

## Routing Strategy

```
/                           → Redirect to /dashboard/default
/auth/v1/login              → Public (login form)
/auth/v2/login              → Public (alternate login)
/dashboard/*                → Protected (requires auth)
/unauthorized               → Public (403 page)
```

Middleware (`src/middleware.ts`):
- Check for `fastschema-auth` in localStorage (via cookie or header)
- If no token and route starts with `/dashboard` → redirect to `/auth/v1/login`
- If token exists → allow

## Build Strategy

- **Docker-first**: All services in containers
- **Docker Compose**: Frontend + FastSchema backend + DB
- **Volume mounts**: Live-reload in dev
- **CI/CD parity**: Local = staging = production

## Error Handling

```
API Error → api.ts catches → throws Error(message)
                             ↓
Page Component → try/catch → toast.error(message)
                             ↓
                         Error boundary (for fatal errors)
```

## Performance Considerations

1. **Server Components** by default — only add "use client" when needed
2. **Suspense + loading.tsx** — streaming for slow data
3. **Pagination** — never load all records at once
4. **Debounced search** — 300ms debounce on search input
5. **Image optimization** — Next.js `Image` component for all images
6. **Font optimization** — Already using next/font
