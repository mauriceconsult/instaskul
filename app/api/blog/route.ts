// app/api/blog/route.ts
export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

// GET - List all blog posts (public + admin filter)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const isAdmin = searchParams.get('admin') === 'true'
    
    const { userId } = await auth()

    // Admin view - all posts
    if (isAdmin && userId) {
      const adminIds = process.env.ADMIN_USER_IDS?.split(',') || []
      if (!adminIds.includes(userId)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
      }

      const posts = await prisma.blogPost.findMany({
        orderBy: { createdAt: 'desc' }
      })

      return NextResponse.json(posts)
    }

    // Public view - only published posts
    const posts = await prisma.blogPost.findMany({
      where: { isPublished: true },
      orderBy: { publishedAt: 'desc' }
    })

    return NextResponse.json(posts)
  } catch (error: any) {
    console.error('[BLOG_GET]', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch posts' },
      { status: 500 }
    )
  }
}

// POST - Create new blog post
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check admin access
    const adminIds = process.env.ADMIN_USER_IDS?.split(',') || []
    if (!adminIds.includes(userId)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const user = await currentUser()
    const body = await req.json()

    const { title, content, excerpt, coverImage, tags, category, isPublished } = body

    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      )
    }

    // Generate slug from title
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
      + `-${Date.now().toString(36)}`

    const post = await prisma.blogPost.create({
      data: {
        title,
        slug,
        content,
        excerpt: excerpt || content.substring(0, 160),
        coverImage,
        authorId: userId,
        authorName: user?.firstName && user?.lastName 
          ? `${user.firstName} ${user.lastName}`
          : user?.emailAddresses[0]?.emailAddress || 'Anonymous',
        authorImage: user?.imageUrl,
        tags: tags || [],
        category,
        isPublished: isPublished || false,
        publishedAt: isPublished ? new Date() : null,
      }
    })

    return NextResponse.json(post)
  } catch (error: any) {
    console.error('[BLOG_POST]', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create post' },
      { status: 500 }
    )
  }
}