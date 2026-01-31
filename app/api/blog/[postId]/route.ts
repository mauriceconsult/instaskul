// app/api/blog/[postId]/route.ts
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

// Helper function to generate slug from title
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

// Helper function to ensure unique slug (excluding current post)
async function getUniqueSlug(baseSlug: string, excludeId?: string): Promise<string> {
  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const existing = await prisma.blogPost.findUnique({ 
      where: { slug },
      select: { id: true }
    });
    
    if (!existing || existing.id === excludeId) {
      break;
    }
    
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
}

// Helper to clean form data
function cleanFormData(data: any) {
  return {
    ...data,
    excerpt: data.excerpt?.trim() || null,
    coverImage: data.coverImage?.trim() || null,
    category: data.category?.trim() || null,
    tags: Array.isArray(data.tags) ? data.tags : [],
    isPublished: Boolean(data.isPublished),
  };
}

// GET - Fetch single post
export async function GET(
  req: Request,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId } = await params; // ✅ Await params in Next.js 15
    
    const post = await prisma.blogPost.findUnique({
      where: {
        id: postId,
      },
    });

    if (!post) {
      return new NextResponse("Not found", { status: 404 });
    }

    return NextResponse.json(post);
  } catch (error) {
    console.error("[BLOG_POST_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// PATCH - Update post
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId } = await params; // ✅ Await params in Next.js 15
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Check if user is admin
    const adminIds = process.env.ADMIN_USER_IDS?.split(',') || [];
    if (!adminIds.includes(userId)) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const body = await req.json();
    console.log('[BLOG_UPDATE] Post ID:', postId);
    console.log('[BLOG_UPDATE] Received data:', body);

    const { title, content, excerpt, coverImage, category, tags, isPublished } = body;

    // Get existing post
    const existingPost = await prisma.blogPost.findUnique({
      where: { id: postId },
    });

    if (!existingPost) {
      return new NextResponse("Not found", { status: 404 });
    }

    // Generate new slug if title changed
    let slug = existingPost.slug;
    if (title && title !== existingPost.title) {
      const baseSlug = generateSlug(title);
      slug = await getUniqueSlug(baseSlug, postId);
    }

    // Clean the data
    const cleanedData = cleanFormData({
      excerpt,
      coverImage,
      category,
      tags,
      isPublished,
    });

    console.log('[BLOG_UPDATE] Cleaned data:', cleanedData);

    // Update post
    const post = await prisma.blogPost.update({
      where: {
        id: postId,
      },
      data: {
        title: title || existingPost.title,
        slug,
        content: content || existingPost.content,
        excerpt: cleanedData.excerpt,
        coverImage: cleanedData.coverImage,
        category: cleanedData.category,
        tags: cleanedData.tags,
        isPublished: cleanedData.isPublished,
      },
    });

    console.log('[BLOG_UPDATE] Post updated successfully:', post.id, 'isPublished:', post.isPublished);

    return NextResponse.json(post);
  } catch (error) {
    console.error("[BLOG_POST_PATCH] Full error:", error);
    console.error("[BLOG_POST_PATCH] Error message:", (error as Error).message);
    return new NextResponse("Internal Error: " + (error as Error).message, { status: 500 });
  }
}

// DELETE - Delete post
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId } = await params; // ✅ Await params in Next.js 15
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Check if user is admin
    const adminIds = process.env.ADMIN_USER_IDS?.split(',') || [];
    if (!adminIds.includes(userId)) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    await prisma.blogPost.delete({
      where: {
        id: postId,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[BLOG_POST_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
