import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import Image from "next/image"
import { format } from "date-fns"
import { InstaSkulLogo } from "@/components/instaskul-logo"
import { Share2, Calendar, Eye } from "lucide-react"

export default async function BlogPostPage({
  params,
}: {
  params: { slug: string }
}) {
  const post = await prisma.blogPost.findUnique({
    where: { slug: params.slug, isPublished: true },
  })

  if (!post) notFound()

  // Fire-and-forget view increment (doesn't block render)
  prisma.blogPost.update({
    where: { id: post.id },
    data: { views: { increment: 1 } },
  }).catch(() => {})

  const postUrl = `https://instaskul.com/blog/${post.slug}`

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <InstaSkulLogo size="sm" showTagline={false} linkTo="/" />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12">
        <article>
          <h1 className="text-4xl font-bold mb-4">{post.title}</h1>

          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
            {post.publishedAt && (
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {format(new Date(post.publishedAt), "MMMM d, yyyy")}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              {post.views} views
            </span>
          </div>

          {post.coverImage && (
            <div className="relative h-96 mb-8 rounded-lg overflow-hidden">
              <Image src={post.coverImage} alt={post.title} fill className="object-cover" />
            </div>
          )}

          <div
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          <div className="mt-8 pt-8 border-t">
            <p className="text-sm font-medium mb-3 flex items-center gap-2">
              <Share2 className="h-4 w-4" />
              Share this post
            </p>

            <div className="flex gap-3">
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(postUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary"
              >
                Share on X
              </a>

              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary"
              >
                Facebook
              </a>

              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(postUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary"
              >
                LinkedIn
              </a>
            </div>
          </div>
        </article>
      </main>
    </div>
  )
}
