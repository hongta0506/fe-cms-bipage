# Sprint 2: Shared Components + Posts CRUD — Detailed Tasks

## T2.1: DataTable Component
**File:** `src/components/ui/data-table.tsx`
**Dependencies:** @tanstack/react-table

### Requirements
- Generic `DataTable<TData>` component accepting columns config + data
- Built-in pagination (page size selector: 10/25/50/100)
- Column sorting (click header to sort)
- Global search input
- Row selection (optional)
- Empty state when no data
- Loading skeleton state

### API
```tsx
<DataTable
  columns={columns}
  data={data}
  isLoading={isLoading}
  searchKey="title"
  pageSize={10}
  onRowClick={(row) => router.push(`/dashboard/posts/${row.id}`)}
/>
```

---

## T2.2: Mutation Hooks
**File:** `src/hooks/use-dashboard.ts` (modify)

### Add 3 hooks
```ts
useCreateContent(schema: string)  // POST /api/content/{schema}
useUpdateContent(schema: string)  // PUT /api/content/{schema}/{id}
useDeleteContent(schema: string)  // DELETE /api/content/{schema}/{id}
```

### Cache Invalidation
- On create: invalidate `["content", schema]`, `["content-count", schema]`, `["stats"]`
- On update: invalidate `["content", schema]`
- On delete: invalidate `["content", schema]`, `["content-count", schema]`, `["stats"]`

---

## T2.3: SlugInput Component
**File:** `src/components/ui/slug-input.tsx`

### Requirements
- Input field for slug
- Auto-generate slug from title (debounced 300ms)
- Slug rules: lowercase, replace spaces with hyphens, remove special chars
- Manual override allowed
- Show preview: "URL will be: /posts/my-post-title"

---

## T2.4: Posts List Page
**Files:**
- `src/app/(main)/dashboard/posts/page.tsx`
- `src/app/(main)/dashboard/posts/_components/posts-table.tsx`

### Columns
| Column | Field | Sortable |
|--------|-------|----------|
| Title | title | Yes |
| Author | author_id → authors.name | Yes |
| Status | status | Yes |
| Created | created_at | Yes |
| Actions | - | No |

### Actions
- Edit → opens PostFormDialog
- Delete → opens PostDeleteDialog

### Page Flow
1. Check auth (redirect to login if not authenticated)
2. Fetch posts via `useContent("posts", { pageSize: 100, sort: "created_at DESC" })`
3. Render DataTable with columns
4. "New Post" button opens PostFormDialog

---

## T2.5: Post Create/Edit Form
**File:** `src/app/(main)/dashboard/posts/_components/post-form.tsx`

### Fields
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| title | text | Yes | Auto-gen slug |
| slug | SlugInput | Yes | Auto-gen from title |
| content | textarea | No | RichTextEditor in Sprint 9 |
| excerpt | textarea | No | Short description |
| status | select | Yes | draft / published |

### Validation (Zod)
```ts
z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required"),
  content: z.string().optional(),
  excerpt: z.string().optional(),
  status: z.enum(["draft", "published"]),
})
```

### Behavior
- Create mode: empty form → POST → close dialog → refetch list
- Edit mode: pre-fill form → PUT → close dialog → refetch list
- Cancel button closes dialog
- Submit shows loading spinner

---

## T2.6: Post Delete Confirmation
**File:** `src/app/(main)/dashboard/posts/_components/post-delete-dialog.tsx`

### Dialog Content
- Title: "Delete Post"
- Body: "Are you sure you want to delete '{title}'? This action cannot be undone."
- Actions: Cancel (secondary) / Delete (destructive)

### Behavior
- Click Delete in table → opens dialog
- Confirm → DELETE API call → close dialog → refetch list
- Show success toast

---

## Acceptance Criteria Checklist
- [ ] DataTable renders with pagination, sorting, search
- [ ] Mutation hooks work (create/update/delete)
- [ ] SlugInput auto-generates from title
- [ ] Posts list loads from API
- [ ] Create post → appears in list
- [ ] Edit post → changes reflected
- [ ] Delete post → confirmation → removed from list
- [ ] Auth gate redirects to login if not authenticated
- [ ] Loading states on all async operations
- [ ] Error handling for API failures
