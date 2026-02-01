// app/admin/blog/new/page.tsx
import { requireAdmin } from "@/lib/is-admin";
import { redirect } from "next/navigation";
import { BlogPostFormWrapper } from '@/components/admin/blog-post-form-wrapper'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function NewBlogPostPage() {
  // Protect the page
  try {
    await requireAdmin();
  } catch {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-background">
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