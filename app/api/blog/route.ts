// app/api/blog/route.ts
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";

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

    const post = await prisma.blogPost.create({
      data: {
        title,
        slug,
        content,
        excerpt: excerpt || null,
        coverImage: coverImage || null,
        category: category || null,
        tags: tags || [],
        isPublished: isPublished || false,
        authorId: userId,
      },
    });

    return NextResponse.json(post);
  } catch (error) {
    console.error("[BLOG_POST]", error);
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