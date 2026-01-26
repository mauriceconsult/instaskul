// app/blog/page.tsx
import { getAllPosts } from '@/lib/blog'
import { InstaSkulLogo } from '@/components/instaskul-logo'
import Link from 'next/link'
import { Calendar, Clock, User, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Image from 'next/image'

export const metadata = {
  title: 'Blog - InstaSkul',
  description: 'Insights on education technology, building in Africa, and the InstaSkul journey',
}

export default async function BlogPage() {
  const posts = await getAllPosts()

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="max-w-4xl mx-auto p-6 flex items-center justify-between">
          <InstaSkulLogo size="sm" showTagline={false} />
          <nav className="flex gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">Dashboard</Button>
            </Link>
            <Link href="/beta/join">
              <Button size="sm">Join Beta</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <div className="bg-gradient-to-b from-muted to-background py-16">
        <div className="max-w-4xl mx-auto px-6">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">InstaSkul Blog</h1>
          <p className="text-xl text-muted-foreground max-w-2xl">
            Building education technology for Africa. Lessons learned, insights shared, 
            and stories from the journey.
          </p>
        </div>
      </div>

      {/* Posts Grid */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        {posts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No posts yet. Check back soon!</p>
          </div>
        ) : (
          <div className="space-y-8">
            {posts.map((post, index) => (
              <article 
                key={post.slug}
                className={`
                  bg-card rounded-lg border overflow-hidden hover:shadow-lg transition-shadow
                  ${index === 0 ? 'md:flex' : ''}
                `}
              >
                {/* Featured post (first post) - horizontal layout on desktop */}
                {index === 0 && post.image && (
                  <div className="md:w-1/2 relative h-64 md:h-auto">
                    <Image
                      src={post.image}
                      alt={post.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}

                <div className={`p-6 ${index === 0 ? 'md:w-1/2' : ''}`}>
                  {/* Tags */}
                  {post.tags.length > 0 && (
                    <div className="flex gap-2 mb-3">
                      {post.tags.slice(0, 3).map(tag => (
                        <span 
                          key={tag}
                          className="text-xs bg-primary/10 text-primary px-2 py-1 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Title */}
                  <Link href={`/blog/${post.slug}`}>
                    <h2 className={`
                      font-bold mb-3 hover:text-primary transition-colors
                      ${index === 0 ? 'text-3xl' : 'text-2xl'}
                    `}>
                      {post.title}
                    </h2>
                  </Link>

                  {/* Description */}
                  <p className="text-muted-foreground mb-4 line-clamp-3">
                    {post.description}
                  </p>

                  {/* Meta */}
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      <span>{post.author}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(post.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{post.readTime}</span>
                    </div>
                  </div>

                  {/* Read More */}
                  <Link href={`/blog/${post.slug}`}>
                    <Button variant="ghost" className="group">
                      Read More
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {/* Newsletter CTA */}
      <div className="bg-muted py-12 mt-12">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-2xl font-bold mb-4">Stay Updated</h2>
          <p className="text-muted-foreground mb-6">
            Get the latest insights on education technology in Africa
          </p>
          <div className="flex gap-2 max-w-md mx-auto">
            <input
              type="email"
              placeholder="your@email.com"
              className="flex-1 px-4 py-2 rounded border bg-background"
            />
            <Button>Subscribe</Button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t py-8 mt-12">
        <div className="max-w-4xl mx-auto px-6 text-center text-sm text-muted-foreground">
          <p>© 2026 InstaSkul. Built in Uganda for Africa.</p>
        </div>
      </footer>
    </div>
  )
}