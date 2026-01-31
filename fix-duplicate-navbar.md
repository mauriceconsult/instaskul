# Fix Duplicate Navbar in /admin/blog

## Issue
The navbar appears twice on /admin/blog pages because AdminHeader is being rendered in the page component AND the layout.

## Solution

Check if you have `app/admin/layout.tsx` or `app/admin/blog/layout.tsx`

If you have either, remove the AdminHeader/Navbar from the page files:

### Remove from these files:

1. **app/admin/blog/page.tsx** - Remove `<AdminHeader />` if present
2. **app/admin/blog/new/page.tsx** - Remove the header section
3. **app/admin/blog/[postId]/page.tsx** - Remove `<AdminHeader />`

### Keep navbar ONLY in layout file

**Option A: If you have app/admin/layout.tsx**
```typescript
// app/admin/layout.tsx
export default function AdminLayout({ children }) {
  return (
    <>
      <AdminHeader /> {/* ✅ Only here */}
      {children}
    </>
  )
}
```

**Option B: If no admin layout, add one**
```bash
# Create the file
touch app/admin/layout.tsx
```

```typescript
// app/admin/layout.tsx
import AdminHeader from '@/components/admin-header'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">
      <AdminHeader />
      {children}
    </div>
  )
}
```

Then remove ALL AdminHeader imports from page files.
