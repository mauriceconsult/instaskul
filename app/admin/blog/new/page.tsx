// app/admin/blog/new/page.tsx
import { redirect } from 'next/navigation'
import { auth } from '@clerk/nextjs/server'
import AdminHeader from '@/components/admin-header'
import { BlogPostFormWrapper } from '@/components/admin/blog-post-form-wrapper'
// import { BlogPostFormWrapper } from '@/components/admin/blog-post-form-wrapper'

export default async function NewBlogPostPage() {
  const { userId } = await auth()

  if (!userId) {
    redirect('/sign-in')
  }

  const adminIds = process.env.ADMIN_USER_IDS?.split(',') || []
  if (!adminIds.includes(userId)) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader />
      
      <main className="p-6 max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Create New Post</h1>
          <p className="text-muted-foreground">
            Share your thoughts with the community
          </p>
        </div>

        <BlogPostFormWrapper />
      </main>
    </div>
  )
}