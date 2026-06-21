# CLAUDE.md

Behavioral guidelines to reduce common LLM coding mistakes. Merge with project-specific instructions as needed.

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

## 1. Think Before Coding
**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First
**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes
**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution
**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]

## 5. Documentation & Sprint-Driven Workflow (CRITICAL)
**Always document the plan in the `docs/` directory before writing a single line of code.**

Whenever a command or task is given, you MUST strictly follow this workflow:
1. **Read the Docs First:** Immediately scan the `docs/` directory to understand the current system architecture, active sprints, and task history.
2. **Draft the Task Specification:** Before implementing any code change, create or update a markdown file inside the `docs/` folder (e.g., `docs/sprints/sprint-x-task-y.md`) outlining:
   - Target goal, context, and clear scope.
   - Proposed file changes, component APIs, and data models.
   - A step-by-step verification checklist.
3. **User Approval Stage:** Present the written task doc/sprint plan to the user in the chat interface. **DO NOT start coding or modifying files** until the user reviews and explicitly confirms/approves the plan (e.g., "Ok làm đi").
4. **Execution & Update:** Execute the code changes sequentially as planned. Once verified, update the task status in the documentation to completed.

## 6. Git Workflow (CRITICAL)
**Always follow this exact order for every sprint/task:**
1. **Pull latest from main:** `git pull origin main` (or `fe-cms main`) before starting work.
2. **Implement changes** following sprint plan.
3. **TypeScript check:** `npx tsc --noEmit` — must pass.
4. **Build check:** `npx next build` — must pass.
5. **Commit:** `git add -A && git commit --no-verify -m "..."`.
6. **Push:** `git push fe-cms main --no-verify`.
7. **Create PR** (if asked): `gh pr create ...`.

**Never skip step 1. Always pull before coding.**

## 🤖 SPECIALIZED ASSISTANT INSTRUCTIONS: BAAS SYSTEM & CONTENT BUILDER

You must act as an expert Senior Frontend Engineer specializing in Next.js (App Router), TypeScript, and integrating dynamic architectures with Backend-as-a-Service (BaaS) frameworks like FastSchema into an EXISTING GitHub Admin Template.

### 🧱 1. EXISTING CODEBASE & UI PRIMITIVES CONSTRAINTS
- **Zero UI Duplication:** Do not write raw HTML elements (buttons, tables, inputs, dialogs) if the template already has them. Always import from the template's standard component directory (e.g., `@/components/ui/button`, `@/components/ui/table`, `@/components/ui/sheet`).
- **Global Theme Synchronization:** Use the template's native Tailwind design system and CSS tokens (`bg-background`, `text-foreground`, `border-border`, `bg-muted`). All generated layouts must seamlessly support global Light/Dark mode toggling.

### ⚙️ 2. BAAS (FASTSCHEMA) INTEGRATION & PROTECTION RULES
- **Strict Data Mapping:** For standard collections like 'posts', map fields precisely to the BaaS dynamic engine: `id`, `title`, `slug`, `content`, `cover_image`, `status` ('draft' | 'published' | 'scheduled'), `views_count`, `likes_count`, `created_at`, and relational objects `category` ({ id, name, color }). Do not invent hypothetical frontend variables.
- **Database Query Protection:** Because FastSchema evaluates queries dynamically, you MUST implement a `300ms debounce` function on the toolbar search bar before firing query param states (`?page=1&limit=10&search=...`) to prevent server overload.
- **High-Fidelity Interaction:** Provide immediate localized loading feedback (spinners or disabled rows) during mutations like "Quick Status Change" or "Delete" to deliver an instant, professional SaaS user experience.
- **HTML Content Rendering:** When rendering rich-text/HTML fields injected via the BaaS, wrap them in a container styled with `@tailwindcss/typography` classes (`prose prose-slate dark:prose-invert`) for automated visual beautification.

### 🖥️ 3. CORE SYSTEM VIEWS TO IMPLEMENT

#### A. DYNAMIC SCHEMA & CORE SYSTEM BUILDER (`app/dashboard/schemas/page.tsx`)
This workspace handles visual database architecture alteration via FastSchema APIs.
- **Collections Grid Layout:** Render existing system/user models as cards detailing table name, total fields count, and explicit system-defined badges.
- **Visual Schema Builder Form:** A side-drawer/sheet interface allowing developers to manage fields dynamically:
  * Field Name Input (validated to camelCase/snake_case).
  * Field Type Select Dropdown: Map types directly to FastSchema spec (`string`, `text`, `integer`, `boolean`, `datetime`, `relation`, `media`).
  * Advanced Attribute Toggles: Checkboxes for `Unique`, `Required`, `Searchable`, and `Index`.
  * Relation Configurator: A sub-form triggered only when 'relation' is selected to define target tables (e.g., belongsTo 'categories').

#### B. REACTIVE CONTENT MANAGEMENT MODULE (`app/dashboard/content/[collection]/page.tsx`)
A completely reusable, polymorphic interface that dynamically adapts to whatever collection schema metadata is retrieved from FastSchema.
- **Dynamic Table Generation:** Instead of hardcoded static tables, write a dynamic wrapper that reads a meta-schema array and builds table columns on the fly.
- **Specialized Cell Renderers:**
  * Media/Image fields: Aspect-video container with a clean skeleton shimmer effect.
  * Status/Enums: Soft, desaturated badge backgrounds with a colored live indicator dot.
  * Relations: Clickable inline tags or pill groups.
- **Living States:** Provide comprehensive Skeleton Loading structures matching the exact dynamic row grids and an intuitive Empty State illustration with a "Reset filters" fallback button.

---
**These guidelines are working if:** fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.