// app/api/blog/route.ts
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

// Helper function to ensure unique slug
async function getUniqueSlug(baseSlug: string): Promise<string> {
  let slug = baseSlug;
  let counter = 1;

  while (await prisma.blogPost.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
}

// Helper to clean form data (convert empty strings to null)
function cleanFormData(data: any) {
  return {
    ...data,
    excerpt: data.excerpt?.trim() || null,
    coverImage: data.coverImage?.trim() || null,
    category: data.category?.trim() || null,
    tags: Array.isArray(data.tags) ? data.tags : [],
    isPublished: Boolean(data.isPublished), // Ensure boolean
  };
}

export async function POST(req: Request) {
  try {
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
    const { title, content, excerpt, coverImage, category, tags, isPublished } = body;

    // Validate required fields
    if (!title || !content) {
      return new NextResponse("Title and content are required", { status: 400 });
    }

    // Generate unique slug from title
    const baseSlug = generateSlug(title);
    const slug = await getUniqueSlug(baseSlug);

    // Clean the data
    const cleanedData = cleanFormData({ excerpt, coverImage, category, tags, isPublished });

    console.log('[BLOG_CREATE] Creating post with data:', {
      title,
      slug,
      ...cleanedData,
      authorId: userId,
    });

    const post = await prisma.blogPost.create({
      data: {
        title,
        slug,
        content,
        excerpt: cleanedData.excerpt,
        coverImage: cleanedData.coverImage,
        category: cleanedData.category,
        tags: cleanedData.tags,
        isPublished: cleanedData.isPublished,
        authorId: userId,
      },
    });

    console.log('[BLOG_CREATE] Post created successfully:', post.id, 'isPublished:', post.isPublished);

    return NextResponse.json(post);
  } catch (error) {
    console.error("[BLOG_POST_CREATE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function GET() {
  try {
    const posts = await prisma.blogPost.findMany({
      where: {
        isPublished: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(posts);
  } catch (error) {
    console.error("[BLOG_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
