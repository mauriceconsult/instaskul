// app/api/blog/[postId]/route.ts
export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

// GET - Single blog post
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId } = await params

    const post = await prisma.blogPost.findUnique({
      where: { id: postId }
    })

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    // Increment views
    await prisma.blogPost.update({
      where: { id: postId },
      data: { views: { increment: 1 } }
    })

    return NextResponse.json(post)
  } catch (error: any) {
    console.error('[BLOG_GET_SINGLE]', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch post' },
      { status: 500 }
    )
  }
}

// PATCH - Update blog post
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const adminIds = process.env.ADMIN_USER_IDS?.split(',') || []
    if (!adminIds.includes(userId)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { postId } = await params
    const body = await req.json()

    const { title, content, excerpt, coverImage, tags, category, isPublished } = body

    // If publishing for the first time, set publishedAt
    const currentPost = await prisma.blogPost.findUnique({
      where: { id: postId },
      select: { isPublished: true, publishedAt: true }
    })

    const updateData: any = {
      title,
      content,
      excerpt,
      coverImage,
      tags,
      category,
      isPublished,
    }

    // Set publishedAt if publishing for the first time
    if (isPublished && !currentPost?.isPublished) {
      updateData.publishedAt = new Date()
    }

    // Clear publishedAt if unpublishing
    if (!isPublished && currentPost?.isPublished) {
      updateData.publishedAt = null
    }

    const post = await prisma.blogPost.update({
      where: { id: postId },
      data: updateData
    })

    return NextResponse.json(post)
  } catch (error: any) {
    console.error('[BLOG_PATCH]', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update post' },
      { status: 500 }
    )
  }
}

// DELETE - Delete blog post
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const adminIds = process.env.ADMIN_USER_IDS?.split(',') || []
    if (!adminIds.includes(userId)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { postId } = await params

    await prisma.blogPost.delete({
      where: { id: postId }
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('[BLOG_DELETE]', error)
    return NextResponse.json(
      { error: error.message || 'Failed to delete post' },
      { status: 500 }
    )
  }
}