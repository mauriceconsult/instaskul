// app/admin/blog/[postId]/page.tsx
import { redirect } from 'next/navigation'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import AdminHeader from '@/components/admin-header'
import { BlogPostFormWrapper } from '@/components/admin/blog-post-form-wrapper'

export default async function EditBlogPostPage({
  params
}: {
  params: Promise<{ postId: string }>
}) {
  const { userId } = await auth()
  const { postId } = await params

  if (!userId) {
    redirect('/sign-in')
  }

  const adminIds = process.env.ADMIN_USER_IDS?.split(',') || []
  if (!adminIds.includes(userId)) {
    redirect('/dashboard')
  }

  const post = await prisma.blogPost.findUnique({
    where: { id: postId }
  })

  if (!post) {
    redirect('/admin/blog')
  }

  // Convert to serializable format
  const initialData = {
    id: post.id,
    title: post.title,
    content: post.content,
    excerpt: post.excerpt || undefined,
    coverImage: post.coverImage || undefined,
    tags: post.tags,
    category: post.category || undefined,
    isPublished: post.isPublished,
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader />
      
      <main className="p-6 max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Edit Post</h1>
          <p className="text-muted-foreground">
            Update your blog content
          </p>
        </div>

        <BlogPostFormWrapper initialData={initialData} />
      </main>
    </div>
  )
}