---
name: multi-domain-proposal
description: Proposed architecture for multi-domain/multi-project support with dynamic menus and schemas
type: project
---

# Multi-Domain / Multi-Project Architecture Proposal

## Context
FastSchema supports multiple projects with different schemas per domain. Current sidebar menu is hardcoded — doesn't adapt when switching domains. Need architecture that supports:
- Domain A: posts, categories, authors, menus (Bipage news)
- Domain B: lottery results, draws (completely different tables)

## Options

### Option A: Dynamic Sidebar from API Schemas (Auto)
- Domain switch → fetch schemas for domain → auto-render menu
- Pros: Fully automatic, no hardcoding
- Cons: Requires backend `GET /api/schema?domain_id=X` endpoint

### Option B: Config-Driven Menu
- JSON/TS config per domain defining menu structure
- Domain switch → load config → render sidebar
- Pros: Full flexibility per domain
- Cons: Manual maintenance per domain

### Option C: Hybrid (Recommended)
- Auto-render menu from API schemas
- Allow per-domain config overrides (reorder, group, hide, add sections)
- Schema has optional `menu_group` field for section grouping

## Recommended Approach: Hybrid

### Flow
1. User selects domain → `selectedDomainId` in Zustand
2. Fetch schemas filtered by domain: `useSchemas({ domainId })`
3. Auto-generate menu items from schemas
4. Apply domain-specific overrides from config (if any)
5. Render sidebar

### Config Structure
```ts
interface DomainMenuConfig {
  domainId: number;
  groups: {
    name: string;       // e.g., "Content", "System"
    schemaNames: string[];
    order: number;
  }[];
  hiddenSchemas: string[];
  customLinks?: { title: string; url: string; icon?: string }[];
}
```

### Backend Requirements
- `GET /api/schema?domain_id=X` — schemas filtered by domain
- Schema field `menu_group` (optional) — auto-grouping

### Status
- [ ] Propose to user
- [ ] Implement backend filtering
- [ ] Implement hybrid menu renderer
- [ ] Add domain config store
- [ ] Test with second domain (lottery)
