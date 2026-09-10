# Sprint 12 Task — Fix dynamic schema label crash

## Status
Completed

## Goal
Render `/dashboard/content/lottery_draw_result` when FastSchema schema metadata omits `label`.

## Context
FastSchema content API is healthy and contains 46,453 `lottery_draw_result` records. Dashboard crashes because `DynamicSchemaPage` calls `schema.label.replace(...)` and `schema.label.toLowerCase()` while FastSchema may omit `label`.

## Scope
- Treat schema `label` as optional API metadata.
- Derive display label from `schema.name` when `label` is absent.
- Reuse derived label in page heading, create button, empty state, and dialogs.
- Do not change FastSchema tables, fields, relations, or stored records.

## Proposed files
- `src/components/ui/dynamic-schema-page.tsx`
  - Change `SchemaDef.label` to optional.
  - Compute one fallback display label from `schema.name`.
  - Replace unsafe direct uses of `schema.label`.
- This document
  - Mark task completed after verification.

## API and data model
No API contract change. Frontend model becomes truthful:

```ts
interface SchemaDef {
  name: string;
  label?: string;
  icon?: string;
  fields: SchemaField[];
}
```

Fallback example: `lottery_draw_result` becomes `Lottery Draw Result`.

## Verification
- [ ] TypeScript check passes or only documented pre-existing failures remain.
- [ ] Production build passes or only documented pre-existing failures remain.
- [ ] `/dashboard/content/lottery_draw_result` renders without `.replace()` error.
- [ ] Page uses `Lottery Draw Result` when backend label is absent.
- [ ] Schemas with explicit labels preserve those labels.
- [ ] FastSchema API still returns existing records; no schema/data mutation occurs.
