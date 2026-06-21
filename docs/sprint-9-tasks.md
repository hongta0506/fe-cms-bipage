# Sprint 9: Polish & Enhancement

## Goal
Tăng cường UX cho admin dashboard: rich text editor, image picker, wired post form, settings edit, loading states, responsive.

## Task Specification

### T9.1: RichTextEditor for Posts
- **Mục tiêu:** Thay textarea trong post form bằng WYSIWYG editor
- **Yêu cầu:** Integrate `@tiptap/react` (shadcn-compatible) hoặc dùng `react-quill`
- **Files:** `src/app/(main)/dashboard/posts/_components/post-form.tsx`
- **Lưu ý:** Giữ simple — toolbar cơ bản (bold, italic, heading, link, image)

### T9.2: ImagePicker Component
- **Mục tiêu:** Component tái sử dụng để chọn ảnh từ API files
- **Yêu cầu:**
  - Dialog hiển thị grid thumbnails từ `GET /api/content/file?filter=type=image`
  - Upload tab (drag-drop zone)
  - Select button → trả về URL
- **Files:** `src/components/ui/image-picker.tsx` (NEW)
- **Sử dụng:** Banner form (image field), Post form (cover_image)

### T9.3: Post Form Relations
- **Mục tiêu:** Wire author_id, category_id, tags vào post form
- **Yêu cầu:**
  - Author dropdown (fetch từ `useContent("authors")`)
  - Category dropdown (fetch từ `useContent("categories")`)
  - Tags multi-select (fetch từ `useContent("tags")`)
- **Files:** `src/app/(main)/dashboard/posts/_components/post-form.tsx`

### T9.4: Settings Form
- **Mục tiêu:** Cho phép edit settings (hiện tại read-only)
- **Yêu cầu:**
  - Inline edit hoặc edit dialog cho từng setting
  - PUT `/api/content/settings/{id}` để update value
- **Files:** `src/app/(main)/dashboard/settings/page.tsx`

### T9.5: Skeleton Loaders
- **Mục tiêu:** Loading states cho tất cả list pages
- **Yêu cầu:** Tạo `loading.tsx` cho mỗi route
- **Files:** `src/app/(main)/dashboard/*/loading.tsx`
- **Pattern:** 5-6 skeleton rows matching table columns

### T9.6: Error Boundary
- **Mục tiêu:** Graceful error handling cho dashboard
- **Yêu cầu:** Next.js error.tsx boundary với retry button
- **Files:** `src/app/(main)/dashboard/error.tsx` (NEW)

### T9.7: Responsive Pass
- **Mục tiêu:** Mobile-friendly sidebar và tables
- **Yêu cầu:**
  - Mobile: collapsible sidebar (hamburger menu)
  - Tables: horizontal scroll on mobile
- **Files:** `src/app/(main)/dashboard/_components/sidebar/`, `src/components/ui/data-table.tsx`

### T9.8: Profile Page
- **Mục tiêu:** Cho user edit profile
- **Yêu cầu:**
  - Form hiển thị name, email từ `GET /api/auth/me`
  - PUT `/api/auth/me` hoặc `/api/content/user/{id}` để update
- **Files:** `src/app/(main)/dashboard/profile/page.tsx` (NEW)

### T9.9: File Upload
- **Mục tiêu:** Upload files trực tiếp từ files page
- **Yêu cầu:** Drag-drop zone + file input, POST multipart
- **Files:** `src/app/(main)/dashboard/files/_components/file-upload.tsx` (NEW)

---

## Priority
1. T9.1 (RichText) + T9.2 (ImagePicker) + T9.3 (Post relations) — Content quality
2. T9.4 (Settings form) + T9.5 (Skeletons) + T9.6 (Error boundary) — UX polish
3. T9.7 (Responsive) + T9.8 (Profile) + T9.9 (File upload) — Nice to have

## Dependencies
- T9.2 (ImagePicker) needed by T9.1 (optional) and banner form
- T9.3 depends on authors/categories/tags APIs (already working)
- Others are independent

## Estimated Effort
- T9.1: 2h
- T9.2: 2h
- T9.3: 1.5h
- T9.4: 1.5h
- T9.5: 1h
- T9.6: 30min
- T9.7: 2h
- T9.8: 1h
- T9.9: 1.5h
- **Total: ~13h**
