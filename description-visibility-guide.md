# Description Visibility & Comments Implementation Guide

## 📋 WHERE DESCRIPTIONS ARE DISPLAYED

### ✅ CURRENTLY SHOWING FULL HTML (Correct)
1. **Coursework Detail** (`/courses/[courseId]/courseworks/[courseworkId]`)
   - Uses `dangerouslySetInnerHTML`
   - Shows full TipTap HTML ✅

2. **Assignment Detail** (`/courses/[courseId]/tutors/[tutorialId]/assignments/[assignmentId]`)
   - Uses `dangerouslySetInnerHTML`
   - Shows full TipTap HTML ✅

### ❌ CURRENTLY SHOWING PLAIN TEXT (Needs Fix)
1. **Admin Page** (`/admins/[adminId]`)
   - Line 87-90: `<p>{admin.description}</p>`
   - Should use `<HtmlContent content={admin.description} />` ❌

2. **Course Browse/Detail** (various locations)
   - Showing description as plain text
   - Should use `<HtmlContent content={course.description} />` ❌

3. **Noticeboard Detail** (`/admins/[adminId]/noticeboards/[noticeboardId]`)
   - Currently uses `dangerouslySetInnerHTML` ✅
   - BUT missing comments section ❌

4. **Course Noticeboard Detail** (`/courses/[courseId]/coursenoticeboards/[noticeboardId]`)
   - Currently uses `dangerouslySetInnerHTML` ✅
   - BUT missing comments section ❌

---

## 🔧 FIXES NEEDED

### 1. Admin Detail Page
**File:** `app/admins/[adminId]/page.tsx`

**Current (lines 87-90):**
```tsx
{admin.description && (
  <p className="text-slate-600 mb-4 leading-relaxed">
    {admin.description}
  </p>
)}
```

**Fix:**
```tsx
import { HtmlContent } from "@/components/html-content";

{admin.description && (
  <HtmlContent 
    content={admin.description}
    className="text-slate-600 mb-4 leading-relaxed"
  />
)}
```

### 2. Course Cards (Browse Page)
**Locations:** 
- `/dashboard/search` (browse page)
- `/admins/[adminId]` (admin's courses)

**Current:**
```tsx
{course.description && (
  <p className="text-sm text-slate-600 mb-4 line-clamp-2">
    {course.description}
  </p>
)}
```

**Fix:**
```tsx
import { HtmlContent } from "@/components/html-content";

{course.description && (
  <HtmlContent 
    content={course.description}
    className="text-sm text-slate-600 mb-4 line-clamp-2"
  />
)}
```

### 3. Noticeboard Detail - Add Comments
**File:** `app/admins/[adminId]/noticeboards/[noticeboardId]/page.tsx`

**Add at the end (before closing `</main>`):**
```tsx
import { NoticeboardComments } from "@/components/noticeboard-comments";

// In the page component, fetch comments
const comments = await fetch(
  `${process.env.NEXT_PUBLIC_APP_URL}/api/noticeboards/${noticeboardId}/comments`
).then(res => res.json());

// Add before closing </main>
<div className="mt-12">
  <NoticeboardComments
    noticeboardId={noticeboardId}
    initialComments={comments}
    type="noticeboard"
  />
</div>
```

### 4. Course Noticeboard Detail - Add Comments
**File:** `app/courses/[courseId]/coursenoticeboards/[noticeboardId]/page.tsx`

**Add at the end (before closing `</main>`):**
```tsx
import { NoticeboardComments } from "@/components/noticeboard-comments";

// In the page component, fetch comments
const comments = await fetch(
  `${process.env.NEXT_PUBLIC_APP_URL}/api/coursenoticeboards/${noticeboardId}/comments`
).then(res => res.json());

// Add before closing </main>
<div className="mt-12">
  <NoticeboardComments
    noticeboardId={noticeboardId}
    initialComments={comments}
    type="coursenoticeboard"
  />
</div>
```

---

## 📦 NEW FILES TO ADD

### Components
1. `components/html-content.tsx` - Renders HTML content safely
2. `components/noticeboard-comments.tsx` - Comment system with replies

### API Routes
1. `app/api/noticeboards/[noticeboardId]/comments/route.ts`
2. `app/api/coursenoticeboards/[noticeboardId]/comments/route.ts`

---

## 🎯 IMPLEMENTATION CHECKLIST

### Phase 1: Fix Description Display
- [ ] Add `html-content.tsx` component
- [ ] Update Admin detail page to use `HtmlContent`
- [ ] Update Course cards to use `HtmlContent`
- [ ] Update any other places showing descriptions as plain text

### Phase 2: Add Comments
- [ ] Add `noticeboard-comments.tsx` component
- [ ] Add noticeboard comments API route
- [ ] Add course noticeboard comments API route
- [ ] Update noticeboard detail page with comments
- [ ] Update course noticeboard detail page with comments

### Phase 3: Test
- [ ] Test HTML rendering (bold, italic, lists, etc.)
- [ ] Test posting comments
- [ ] Test posting replies
- [ ] Test comment authentication
- [ ] Test on both noticeboard types

---

## 🎨 COMMENT FEATURES

### What Students Can Do:
✅ View all comments on announcements
✅ Post new comments
✅ Reply to comments
✅ See user names and timestamps
✅ See threaded replies

### What's Protected:
🔒 Must be signed in to comment
🔒 User's name automatically attached
🔒 Can only delete own comments (future feature)

---

## 📊 COMPLETE DESCRIPTION VISIBILITY MAP

| Location | Description Type | Current Display | Should Display |
|----------|-----------------|-----------------|----------------|
| Admin Page | Admin bio | Plain text ❌ | HTML with `HtmlContent` |
| Course Cards | Course overview | Plain text ❌ | HTML with `HtmlContent` |
| Tutorial Page | Tutorial info | Plain text ❌ | HTML with `HtmlContent` |
| Coursework Detail | Instructions | HTML ✅ | Already correct |
| Assignment Detail | Instructions | HTML ✅ | Already correct |
| Noticeboard | Announcement | HTML ✅ | Already correct |
| Course Noticeboard | Announcement | HTML ✅ | Already correct |

---

## 💡 KEY POINTS

1. **TipTap saves HTML** - All descriptions from the editor are HTML strings
2. **Need `dangerouslySetInnerHTML`** - Or use the `HtmlContent` wrapper component
3. **Comments are separate** - Stored in different tables (NoticeboardComment vs CourseNoticeboardComment)
4. **Replies use self-reference** - The `adminId`/`courseId` field links to parent comment

---

## 🚀 QUICK START

1. **Add the components:**
   ```bash
   cp html-content.tsx components/html-content.tsx
   cp noticeboard-comments.tsx components/noticeboard-comments.tsx
   ```

2. **Add API routes:**
   ```bash
   mkdir -p app/api/noticeboards/[noticeboardId]/comments
   mkdir -p app/api/coursenoticeboards/[noticeboardId]/comments
   
   cp noticeboard-comments-api.ts app/api/noticeboards/[noticeboardId]/comments/route.ts
   cp course-noticeboard-comments-api.ts app/api/coursenoticeboards/[noticeboardId]/comments/route.ts
   ```

3. **Update pages to use `HtmlContent`:**
   - Replace `{description}` or `<p>{description}</p>`
   - With `<HtmlContent content={description} />`

4. **Add comments to noticeboard pages:**
   - Import `NoticeboardComments`
   - Fetch comments in server component
   - Render component with props
