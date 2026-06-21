# Schema ↔ Screen Mapping

How each FastSchema schema maps to admin dashboard screens.

---

## Overview

```
FastSchema Schema  →  Admin Screen  →  API Calls  →  Components
```

---

## 1. `posts` → Posts Management

### Screens
| Route | Purpose |
|-------|---------|
| `/dashboard/posts` | List all posts (DataTable) |
| `/dashboard/posts/new` | Create new post (Form) |
| `/dashboard/posts/[id]` | Edit post (Form) |
| `/dashboard/default` | KPI: total posts count |

### API Calls
```
GET    /api/content/posts?page=1&pageSize=20&sort=created_at DESC
GET    /api/content/posts/{id}
POST   /api/content/posts
PUT    /api/content/posts/{id}
DELETE /api/content/posts/{id}
GET    /api/content/posts?pageSize=0          → total count for KPI
GET    /api/content/posts?filter=status="published" → published count
```

### Components
```
dashboard/posts/page.tsx                    — Page wrapper
dashboard/posts/_components/posts-table.tsx — DataTable with columns:
  ├── Title (string)
  ├── Author (relation → authors)
  ├── Status (badge: draft/published)
  ├── Created At (date)
  └── Actions (edit, delete)
dashboard/posts/_components/post-form.tsx    — Create/Edit form:
  ├── title (Input, required)
  ├── slug (SlugInput, auto from title)
  ├── content (TextArea or RichText)
  ├── excerpt (TextArea)
  ├── featured_image (ImagePicker)
  ├── author_id (Select → /api/content/authors)
  ├── category_ids (MultiSelect → /api/content/categories)
  ├── tag_ids (MultiSelect → /api/content/tags)
  └── status (Select: draft/published)
```

### Relations
- `posts` → `authors` (many-to-one via author_id)
- `posts` → `categories` (many-to-many via posts_categories)
- `posts` → `tags` (many-to-many via posts_tags)

---

## 2. `pages` → Pages Management

### Screens
| Route | Purpose |
|-------|---------|
| `/dashboard/pages` | List all pages |
| `/dashboard/pages/new` | Create new page |
| `/dashboard/pages/[id]` | Edit page |

### API Calls
```
GET    /api/content/pages?page=1&pageSize=20
GET    /api/content/pages/{id}
POST   /api/content/pages
PUT    /api/content/pages/{id}
DELETE /api/content/pages/{id}
```

### Components
```
dashboard/pages/page.tsx
dashboard/pages/_components/pages-table.tsx — Columns:
  ├── Title
  ├── Slug
  ├── Status (draft/published)
  ├── Template
  └── Actions
dashboard/pages/_components/page-form.tsx — Form:
  ├── title (Input)
  ├── slug (SlugInput)
  ├── content (TextArea/RichText)
  ├── status (Select)
  └── template (Select: default, landing, about)
```

---

## 3. `products` → Products Management

### Screens
| Route | Purpose |
|-------|---------|
| `/dashboard/products` | List all products |
| `/dashboard/products/new` | Create new product |
| `/dashboard/products/[id]` | Edit product |
| `/dashboard/ecommerce` | KPI: total products, revenue |

### API Calls
```
GET    /api/content/products?page=1&pageSize=20
GET    /api/content/products/{id}
POST   /api/content/products
PUT    /api/content/products/{id}
DELETE /api/content/products/{id}
GET    /api/content/products?filter=status="active" → active count
GET    /api/content/orders?pageSize=0 → total orders for revenue
```

### Components
```
dashboard/products/page.tsx
dashboard/products/_components/products-table.tsx — Columns:
  ├── Name
  ├── Price (formatted currency)
  ├── Stock (number, red if 0)
  ├── Status (active/inactive badge)
  ├── Categories (tags)
  └── Actions
dashboard/products/_components/product-form.tsx — Form:
  ├── name (Input)
  ├── slug (SlugInput)
  ├── description (TextArea)
  ├── price (NumberInput)
  ├── stock (NumberInput)
  ├── images (ImagePicker, multi)
  ├── category_ids (MultiSelect → /api/content/categories)
  ├── tag_ids (MultiSelect → /api/content/tags)
  └── status (Select: active/inactive)
```

### Relations
- `products` → `categories` (many-to-many via products_categories)
- `products` → `tags` (many-to-many via products_tags)

---

## 4. `orders` → Orders Management

### Screens
| Route | Purpose |
|-------|---------|
| `/dashboard/orders` | List all orders |
| `/dashboard/orders/[id]` | View order detail |
| `/dashboard/ecommerce` | Recent orders widget |

### API Calls
```
GET    /api/content/orders?page=1&pageSize=20&sort=created_at DESC
GET    /api/content/orders/{id}
PUT    /api/content/orders/{id}          → update status
GET    /api/content/order_items?filter=order_id={id} → order items
GET    /api/content/orders?filter=status="pending"  → pending count
```

### Components
```
dashboard/orders/page.tsx
dashboard/orders/_components/orders-table.tsx — Columns:
  ├── Order ID
  ├── Customer Name
  ├── Total (currency)
  ├── Status (badge: pending/processing/shipped/delivered)
  ├── Date
  └── Actions (view, update status)
dashboard/orders/[id]/page.tsx
dashboard/orders/[id]/_components/order-detail.tsx — Layout:
  ├── Customer Info card
  ├── Order Items table (from order_items)
  ├── Status Timeline
  └── Update Status button
```

### Relations
- `orders` → `order_items` (one-to-many)
- `order_items` → `products` (many-to-one via product_id)

---

## 5. `categories` → Categories Management

### Screens
| Route | Purpose |
|-------|---------|
| `/dashboard/categories` | List/tree categories |
| `/dashboard/categories/new` | Create category |
| `/dashboard/categories/[id]` | Edit category |
| Various forms | Select dropdown (reused) |

### API Calls
```
GET    /api/content/categories
GET    /api/content/categories/{id}
POST   /api/content/categories
PUT    /api/content/categories/{id}
DELETE /api/content/categories/{id}
```

### Components
```
dashboard/categories/page.tsx
dashboard/categories/_components/categories-table.tsx — Columns:
  ├── Name
  ├── Slug
  ├── Parent (tree structure)
  ├── Items Count (computed)
  └── Actions
dashboard/categories/_components/category-form.tsx — Form:
  ├── name (Input)
  ├── slug (SlugInput)
  ├── description (TextArea)
  └── parent_id (Select → self-referencing tree)
```

### Relations
- `categories` → `categories` (self-referencing parent_id for tree)
- `categories` → `posts` (via posts_categories)
- `categories` → `products` (via products_categories)

---

## 6. `tags` → Tags Management

### Screens
| Route | Purpose |
|-------|---------|
| `/dashboard/tags` | List tags |
| `/dashboard/tags/new` | Create tag |
| Various forms | Select/combobox (reused) |

### API Calls
```
GET    /api/content/tags
POST   /api/content/tags
DELETE /api/content/tags/{id}
```

### Components
```
dashboard/tags/page.tsx
dashboard/tags/_components/tags-table.tsx — Columns:
  ├── Name
  ├── Slug
  ├── Posts Count
  ├── Products Count
  └── Actions (delete)
dashboard/tags/_components/tag-form.tsx — Simple form:
  ├── name (Input)
  └── slug (SlugInput)
```

---

## 7. `authors` → Authors Management

### Screens
| Route | Purpose |
|-------|---------|
| `/dashboard/authors` | List authors |
| `/dashboard/authors/new` | Create author |
| `/dashboard/authors/[id]` | Edit author |

### API Calls
```
GET    /api/content/authors
GET    /api/content/authors/{id}
POST   /api/content/authors
PUT    /api/content/authors/{id}
DELETE /api/content/authors/{id}
```

### Components
```
dashboard/authors/page.tsx
dashboard/authors/_components/authors-table.tsx — Columns:
  ├── Avatar
  ├── Name
  ├── Email
  ├── Posts Count
  └── Actions
dashboard/authors/_components/author-form.tsx — Form:
  ├── name (Input)
  ├── email (Input)
  ├── bio (TextArea)
  └── avatar (ImagePicker)
```

---

## 8. `banners` → Banner Management

### Screens
| Route | Purpose |
|-------|---------|
| `/dashboard/banners` | List banners |
| `/dashboard/banners/new` | Create banner |
| `/dashboard/banners/[id]` | Edit banner |

### API Calls
```
GET    /api/content/banners?sort=order ASC
POST   /api/content/banners
PUT    /api/content/banners/{id}
DELETE /api/content/banners/{id}
```

### Components
```
dashboard/banners/page.tsx
dashboard/banners/_components/banners-table.tsx — Columns:
  ├── Preview (image thumbnail)
  ├── Title
  ├── Link
  ├── Status (active/inactive)
  ├── Order (drag to reorder)
  └── Actions
dashboard/banners/_components/banner-form.tsx — Form:
  ├── title (Input)
  ├── image (ImagePicker)
  ├── link (Input/URL)
  ├── status (Select)
  └── order (NumberInput)
```

---

## 9. `files` → Media Library

### Screens
| Route | Purpose |
|-------|---------|
| `/dashboard/files` | Grid/list view of files |
| Various forms | ImagePicker dialog (reused) |

### API Calls
```
GET    /api/content/files?page=1&pageSize=20&sort=created_at DESC
POST   /api/content/files        → upload file (multipart)
DELETE /api/content/files/{id}
GET    /api/tool/stats           → total files count
```

### Components
```
dashboard/files/page.tsx
dashboard/files/_components/files-grid.tsx — Grid layout:
  ├── Image thumbnails (for images)
  ├── File icons (for non-images)
  ├── File name, size, date
  └── Actions (preview, copy URL, delete)
dashboard/files/_components/file-upload.tsx — Upload zone:
  ├── Drag & drop area
  ├── File input
  └── Progress bar
components/media/image-picker.tsx — Reusable dialog:
  ├── File grid (existing files)
  ├── Upload tab
  └── Select button
```

---

## 10. `menus` → Menu Management

### Screens
| Route | Purpose |
|-------|---------|
| `/dashboard/menus` | List menus |
| `/dashboard/menus/new` | Create menu with items |

### API Calls
```
GET    /api/content/menus
GET    /api/content/menus/{id}
POST   /api/content/menus
PUT    /api/content/menus/{id}
DELETE /api/content/menus/{id}
GET    /api/content/menu_items?filter=menu_id={id} → menu items
```

### Components
```
dashboard/menus/page.tsx
dashboard/menus/_components/menus-table.tsx
dashboard/menus/[id]/page.tsx
dashboard/menus/[id]/_components/menu-builder.tsx — Drag & drop:
  ├── Menu items tree
  ├── Add item button
  ├── Item fields: label, URL, target, parent
  └── Reorder handles
```

---

## 11. `comments` → Comments Moderation

### Screens
| Route | Purpose |
|-------|---------|
| `/dashboard/comments` | List all comments |
| Inline in posts | Approve/reject actions |

### API Calls
```
GET    /api/content/comments?filter=status="pending"
PUT    /api/content/comments/{id}  → update status
DELETE /api/content/comments/{id}
```

### Components
```
dashboard/comments/page.tsx
dashboard/comments/_components/comments-table.tsx — Columns:
  ├── Author Name
  ├── Content (truncated)
  ├── Post (link)
  ├── Status (pending/approved/rejected)
  ├── Date
  └── Actions (approve, reject, delete)
```

---

## 12. `settings` → Site Settings

### Screens
| Route | Purpose |
|-------|---------|
| `/dashboard/settings` | Edit site settings |

### API Calls
```
GET    /api/content/settings
PUT    /api/content/settings/{id}
```

### Components
```
dashboard/settings/page.tsx
dashboard/settings/_components/settings-form.tsx — Grouped form:
  ├── General: site_name, site_description, logo
  ├── Social: facebook, twitter, instagram URLs
  ├── SEO: meta_title, meta_description
  └── Save button
```

---

## 13. Users + Auth (System)

### Screens
| Route | Purpose |
|-------|---------|
| `/dashboard/users` | List users |
| `/dashboard/roles` | List roles |
| `/dashboard/profile` | Current user profile |

### API Calls
```
GET    /api/auth/users           → list users
GET    /api/auth/users/{id}      → user detail
POST   /api/auth/users           → create user
PUT    /api/auth/users/{id}      → update user
DELETE /api/auth/users/{id}      → delete user
GET    /api/auth/roles           → list roles
GET    /api/tool/stats           → users count, roles count
```

---

## 14. Dashboard Screens (Analytics/Overview)

### `/dashboard/default`
```
API Calls:
  GET /api/tool/stats              → KPIs
  GET /api/content/posts?pageSize=0 → total posts
  GET /api/content/products?pageSize=0 → total products
  GET /api/content/files?pageSize=0 → total files

Components:
  SectionCards            → 4 KPI cards
  ChartAreaInteractive    → Posts creation chart
  ProposalSectionsTable   → Content items table
```

### `/dashboard/ecommerce`
```
API Calls:
  GET /api/content/products         → product list
  GET /api/content/orders           → order list
  GET /api/content/products?pageSize=0 → total products
  GET /api/content/orders?pageSize=0 → total orders

Components:
  KpiStrip           → Revenue, Orders, Products, Customers
  TopProducts        → Top products table
  RecentOrders       → Recent orders table
  StoreTraffic       → Traffic chart
  Inventory          → Stock levels
```

### `/dashboard/analytics`
```
API Calls:
  GET /api/tool/stats
  GET /api/content/posts?pageSize=0 → content metrics

Components:
  AnalyticsKpiStrip  → Visitors, Pageviews, Bounce Rate
  TrafficQuality     → Traffic chart
  RealtimeVisitors   → Live visitors
  TopPages           → Top pages table
```

### `/dashboard/crm`
```
API Calls:
  GET /api/content/posts?pageSize=0 → pipeline items
  GET /api/content/orders → opportunities

Components:
  KpiCards           → Leads, Deals, Revenue
  PipelineActivity   → Pipeline chart
  TaskReminders      → Task list
  OpportunitiesSection → Opportunities table
```

### `/dashboard/finance`
```
API Calls:
  GET /api/content/orders → transactions
  GET /api/tool/stats → overview

Components:
  OverviewKpis       → Balance, Income, Expenses
  Wallet             → Wallet card
  IncomeBreakdown    → Income chart
  TransactionsOverviewCard → Transactions chart
  UpcomingTransactions → Transaction list
```

---

## Summary Matrix

| Schema | List Screen | Create/Edit | Detail | Dashboard KPI |
|--------|-------------|-------------|--------|---------------|
| posts | `/dashboard/posts` | Form dialog/page | — | Content count |
| pages | `/dashboard/pages` | Form dialog/page | — | — |
| products | `/dashboard/products` | Form dialog/page | — | Product count |
| orders | `/dashboard/orders` | Status update only | `/dashboard/orders/[id]` | Order count |
| categories | `/dashboard/categories` | Form dialog/page | — | — |
| tags | `/dashboard/tags` | Simple form | — | — |
| authors | `/dashboard/authors` | Form dialog/page | — | — |
| banners | `/dashboard/banners` | Form dialog/page | — | — |
| files | `/dashboard/files` | Upload zone | — | File count |
| menus | `/dashboard/menus` | Menu builder | `/dashboard/menus/[id]` | — |
| comments | `/dashboard/comments` | Status change only | — | — |
| settings | `/dashboard/settings` | Grouped form | — | — |
| users | `/dashboard/users` | Admin only | — | User count |
| roles | `/dashboard/roles` | Admin only | — | Role count |
