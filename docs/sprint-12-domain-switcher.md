# Sprint 12: Domain Switcher — Multi-Domain Data Filtering

## Date: 2026-06-21

---

## Goal
Add a domain selector in the sidebar that filters ALL data across the dashboard by selected domain. Default = "All Domains" (no filter). Select one domain → API queries include `filter={"domain_id":N}`.

## Context
- FastSchema API supports server-side filtering: `GET /api/content/{schema}?filter=%7B%22domain_id%22%3A{N}%7D`
- Current: all pages load ALL records regardless of domain (4258 posts total, split between BiPage=2178 and BraveTopic=2080)
- Domains: `{ id: 1, name: "BiPage" }`, `{ id: 4, name: "BraveTopic" }`
- Sidebar layout: `SidebarFooter` → `NavUser` (bottom). Domain switcher goes above NavUser.

---

## Architecture: Domain Filter Layer

### 1. Domain Store (Zustand)
**File: `src/stores/domain/domain-store.ts`**

```
interface DomainStore {
  selectedDomainId: number | null;  // null = all domains
  setSelectedDomainId: (id: number | null) => void;
}
```

- Persist to localStorage so selection survives page reload
- Default: `null` (show all)
- On domain change → React Query invalidates all `["content"]` queries automatically

### 2. API Layer Change
**File: `src/lib/api.ts`**

Add optional `domainId` parameter to `getContent()`:
```ts
async getContent(schema: string, options?: {
  page?: number;
  pageSize?: number;
  filter?: string;
  sort?: string;
  domainId?: number | null;
}) {
  // If domainId provided, add filter param
  if (options?.domainId) {
    params.set("filter", JSON.stringify({ domain_id: options.domainId }));
  }
}
```

### 3. Hook Layer Change
**File: `src/hooks/use-dashboard.ts`**

`useContent()` reads `selectedDomainId` from domain store and passes to API:
```ts
export function useContent(schema, options) {
  const domainId = useDomainStore(s => s.selectedDomainId);
  return useQuery({
    queryKey: ["content", schema, { ...options, domainId }],
    queryFn: () => api.getContent(schema, { ...options, domainId }),
    enabled: !!schema,
  });
}
```

This means ALL existing `useContent("posts")` calls automatically filter by domain. Zero changes needed in individual page components.

### 4. Sidebar Domain Switcher Component
**File: `src/app/(main)/dashboard/_components/sidebar/domain-switcher.tsx`**

- Positioned above NavUser in SidebarFooter
- Shows Globe icon + current domain name (or "All Domains")
- Dropdown with: "All Domains" + each domain from API
- Collapsed sidebar: shows Globe icon tooltip

### 5. App Sidebar Integration
**File: `src/app/(main)/dashboard/_components/sidebar/app-sidebar.tsx`**

Add `<DomainSwitcher />` before `<NavUser />` in SidebarFooter.

---

## Files to Change

| File | Change |
|------|--------|
| `src/stores/domain/domain-store.ts` | **NEW** — Zustand store with persist |
| `src/lib/api.ts` | Add `domainId` param to `getContent()` |
| `src/hooks/use-dashboard.ts` | Read domain from store, pass to all queries |
| `src/app/(main)/dashboard/_components/sidebar/domain-switcher.tsx` | **NEW** — Domain selector UI |
| `src/app/(main)/dashboard/_components/sidebar/app-sidebar.tsx` | Import + render DomainSwitcher |

---

## What Does NOT Change
- Individual page components (posts-table, categories-table, etc.) — they already call `useContent()`, filtering is automatic
- Dashboard metric cards, performance charts — same `useContent()` hook
- Post form domain dropdown — keep as-is (still useful for assigning domain to new posts)

---

## Verification
- [ ] Select "BiPage" → posts table shows ~2178 total
- [ ] Select "BraveTopic" → posts table shows ~2080 total  
- [ ] Select "All Domains" → posts table shows ~4258 total
- [ ] Same filtering applies to categories, tags, users, etc.
- [ ] Domain selection persists after page reload
- [ ] Sidebar collapsed: Globe icon visible with tooltip
- [ ] Dashboard metric cards reflect filtered counts
- [ ] Post form still allows selecting any domain when creating/editing
