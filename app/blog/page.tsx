// app/blog/page.tsx
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import Image from 'next/image'
import { format } from 'date-fns'
import { InstaSkulLogo } from '@/components/instaskul-logo'

export default async function BlogPage() {
  const posts = await prisma.blogPost.findMany({
    where: { isPublished: true },
    orderBy: { publishedAt: 'desc' }
  })

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <InstaSkulLogo size="sm" showTagline={false} linkTo="/" />
        </div>
      </header>

      {/* Hero */}
      <div className="bg-gradient-to-b from-muted to-background py-16">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            InstaSkul Blog
          </h1>
          <p className="text-xl text-muted-foreground">
            Insights on education technology, open source, and building for Africa
          </p>
        </div>
      </div>

      {/* Posts Grid */}
      <main className="max-w-5xl mx-auto px-4 py-12">
        {posts.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            No posts published yet. Check back soon!
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2">
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="group"
              >
                <article className="bg-card border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                  {post.coverImage && (
                    <div className="relative w-full h-48">
                      <Image
                        src={post.coverImage}
                        alt={post.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                      {post.category && (
                        <span className="px-2 py-1 bg-primary/10 rounded-full text-xs font-medium">
                          {post.category}
                        </span>
                      )}
                      {post.publishedAt && (
                        <span>{format(new Date(post.publishedAt), 'MMM d, yyyy')}</span>
                      )}
                    </div>
                    <h2 className="text-2xl font-bold mb-2 group-hover:text-primary transition-colors">
                      {post.title}
                    </h2>
                    {post.excerpt && (
                      <p className="text-muted-foreground line-clamp-3">
                        {post.excerpt}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-2 mt-4">
                      {post.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-xs px-2 py-1 bg-muted rounded-full"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}