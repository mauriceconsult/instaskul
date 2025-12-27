import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function PATCH(
  request: Request,
  {
    params,
  }: {
    params: Promise<{ adminId: string }>;
  }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { adminId } = await params;

    // Single query: fetch admin + check ownership + include courses
    const admin = await prisma.admin.findUnique({
      where: {
        id: adminId,
        userId, // Ensures ownership
      },
      include: {
        courses: {
          where: { isPublished: true },
          select: { id: true }, // Only need existence check
        },
      },
    });

    if (!admin) {
      return new NextResponse("Admin not found or unauthorized", { status: 404 });
    }

    // Validate required fields
    if (
      !admin.title ||
      !admin.description ||
      !admin.imageUrl ||
      admin.courses.length === 0
    ) {
      return new NextResponse(
        "Title, description, image, and at least one published course are required",
        { status: 400 }
      );
    }

    // Publish the admin profile
    const publishedAdmin = await prisma.admin.update({
      where: { id: adminId },
      data: { isPublished: true },
    });

    return NextResponse.json(publishedAdmin);
  } catch (error) {
    console.error("[ADMIN_PUBLISH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}