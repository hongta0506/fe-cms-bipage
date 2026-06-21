# Screen Inventory — All Pages

## Auth Screens

### `/auth/v1/login` — Login V1
- **File:** `src/app/(main)/auth/v1/login/page.tsx`
- **Components:** `CardLogo`, `LoginForm`
- **Form fields:** login (username/email), password, remember me
- **API:** `POST /api/auth/local/login` → JWT → `GET /api/auth/me`
- **Status:** ✅ Integrated with FastSchema

### `/auth/v1/register` — Register V1
- **File:** `src/app/(main)/auth/v1/register/page.tsx`
- **Components:** `CardLogo`, `RegisterForm`
- **Status:** ❌ UI only, no API integration

### `/auth/v2/login` — Login V2 (alternate design)
- **File:** `src/app/(main)/auth/v2/login/page.tsx`
- **Status:** ❌ UI only

### `/auth/v2/register` — Register V2 (alternate design)
- **File:** `src/app/(main)/auth/v2/register/page.tsx`
- **Status:** ❌ UI only

---

## Dashboard Screens

### `/dashboard/default` — Default Dashboard ⭐
- **File:** `src/app/(main)/dashboard/default/page.tsx`
- **Components:** `SectionCards`, `ChartAreaInteractive`, `ProposalSectionsTable`
- **Data:** `data.json` passed to table. SectionCards and ChartAreaInteractive have internal data.
- **Content:** Section KPI cards + Interactive area chart + Data table with sortable/filterable columns
- **Layout:** Uses `@container/main` responsive layout
- **FastSchema target:** `GET /api/tool/stats` for KPIs, `GET /api/content/posts` for content stats

### `/dashboard/crm` — CRM Dashboard
- **File:** `src/app/(main)/dashboard/crm/page.tsx`
- **Components:** `KpiCards`, `PipelineActivity`, `TaskReminders`, `OpportunitiesSection`
- **Data:** Hardcoded mock data
- **Content:** CRM KPIs + Pipeline chart + Task list + Opportunities table
- **FastSchema target:** Could map to posts/products for pipeline-like data

### `/dashboard/ecommerce` — E-commerce Dashboard
- **File:** `src/app/(main)/dashboard/ecommerce/page.tsx`
- **Components:** `KpiStrip`, `StoreTraffic`, `TrafficSources`, `TopProducts`, `Inventory`, `CustomerReviews`, `RecentOrders`
- **Data:** Hardcoded mock data
- **Content:** KPI strip + Traffic charts + Top products + Inventory + Reviews + Orders table
- **FastSchema target:** `GET /api/content/products`, `GET /api/content/orders`, `GET /api/content/order_items`

### `/dashboard/analytics` — Analytics Dashboard
- **File:** `src/app/(main)/dashboard/analytics/page.tsx`
- **Components:** `AnalyticsKpiStrip`, `AnalyticsToolbar`, `RealtimeVisitors`, `TopPages`, `TopTrafficSources`, `TrafficQuality`
- **Tabs:** Overview, Audience, Acquisition, Engagement, Conversions
- **Data:** Hardcoded mock data
- **Status:** Only Overview tab implemented; others are placeholders

### `/dashboard/finance` — Finance Dashboard
- **File:** `src/app/(main)/dashboard/finance/page.tsx`
- **Components:** `OverviewKpis`, `IncomeBreakdown`, `FinanceNotification`, `TransactionsOverviewCard`, `BalanceDistributionCard`, `Wallet`, `UpcomingTransactions`, `QuickActions`
- **Tabs:** Dashboard, Accounts, Transactions
- **Data:** Hardcoded mock data
- **Status:** Only Dashboard tab implemented

### `/dashboard/productivity` — Productivity Dashboard
- **File:** `src/app/(main)/dashboard/productivity/page.tsx`
- **Components:** `SummaryCards`, `TasksSection`, `ProjectsSection`, `QuickActions`, `QuoteCard`, `CalendarPanel`, `FocusCard`, `RecentNotesCard`, `WeeklySummaryCard`
- **Data:** Hardcoded mock data

### `/dashboard/academy` — Academy Dashboard
- **File:** `src/app/(main)/dashboard/academy/page.tsx`
- **Components:** `KpiCards`, `ClassSchedule`, `AssignmentStatus`, `PerformanceHighlights`, `UpcomingEvents`
- **Data:** Hardcoded mock data

### `/dashboard/logistics` — Logistics Dashboard
- **File:** `src/app/(main)/dashboard/logistics/page.tsx`
- **Components:** `Logistics` (single wrapper)
- **Data:** Hardcoded mock data

### `/dashboard/infrastructure` — Infrastructure Dashboard
- **File:** `src/app/(main)/dashboard/infrastructure/page.tsx`
- **Components:** `InfrastructureHeader`, `ProjectEnvironments`
- **Data:** `infrastructureGroups` from `infrastructure-data.ts`

### `/dashboard/coming-soon` — Coming Soon
- **File:** `src/app/(main)/dashboard/coming-soon/page.tsx`
- **Status:** Placeholder page

---

## Page Screens (CRUD-like)

### `/dashboard/users` — Users Management
- **File:** `src/app/(main)/dashboard/users/page.tsx`
- **Components:** `Users` (table view)
- **Data:** Hardcoded in `_components/data.ts` (2 users)
- **FastSchema target:** `GET /api/auth/users` or user management API

### `/dashboard/roles` — Roles Management
- **File:** `src/app/(main)/dashboard/roles/page.tsx`
- **Components:** `Roles` (table view)
- **Data:** Hardcoded in `_components/roles-table/data.ts`
- **FastSchema target:** Role management API

### `/dashboard/invoice` — Invoice Creator
- **File:** `src/app/(main)/dashboard/invoice/page.tsx`
- **Components:** `Invoice` (form + preview)
- **Actions:** Save as Draft, Send Invoice
- **Data:** Form-based, no list view

---

## App Screens

### `/dashboard/mail` — Mail Client
- **File:** `src/app/(main)/dashboard/mail/page.tsx`
- **Components:** Full mail client (sidebar + list + compose)
- **Data:** Mock emails

### `/dashboard/chat` — Chat App
- **File:** `src/app/(main)/dashboard/chat/page.tsx`
- **Components:** Chat sidebar + conversation view
- **Data:** Mock messages

### `/dashboard/calendar` — Calendar
- **File:** `src/app/(main)/dashboard/calendar/page.tsx`
- **Components:** FullCalendar integration
- **Data:** Mock events

### `/dashboard/kanban` — Kanban Board
- **File:** `src/app/(main)/dashboard/kanban/page.tsx`
- **Components:** Drag-and-drop kanban columns
- **Data:** Mock tasks

---

## Legacy Screens (v1)
- `/dashboard/default-v1`, `crm-v1`, `finance-v1`, `analytics-v1`
- Older versions of dashboards, kept for reference
- **Action:** Deprecate and remove

---

## Other Routes
- `/` → Redirects to `/dashboard/default`
- `/unauthorized` → 403 page
- `/chat` → Standalone chat (outside dashboard layout)
- `/mail` → Standalone mail (outside dashboard layout)
