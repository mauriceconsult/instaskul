// app/admin/blog/new/page.tsx
import { redirect } from 'next/navigation'
import { auth } from '@clerk/nextjs/server'
import { BlogPostFormWrapper } from '@/components/admin/blog-post-form-wrapper'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

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
      {/* Breadcrumb/Back navigation - NOT a full navbar */}
      <div className="border-b bg-white sticky top-0 z-10">
        <div className="flex items-center gap-4 p-4 max-w-4xl mx-auto">
          <Link href="/admin/blog">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Blog
            </Button>
          </Link>
        </div>
      </div>

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
