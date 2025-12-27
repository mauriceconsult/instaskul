// app/api/admins/[adminId]/courses/[courseId]/courseworks/[courseworkId]/publish/route.ts
import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function PATCH(
  request: Request,
  {
    params,
  }: {
    params: Promise<{
      adminId: string;
      courseId: string;
      courseworkId: string;
    }>;
  }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { adminId, courseId, courseworkId } = await params;

    // Find coursework with ownership check via nested course.adminId
    const coursework = await prisma.coursework.findUnique({
      where: {
        id: courseworkId,
        courseId,
        course: {
          adminId, 
        },
      },
      include: {
        course: true,
      },
    });

    if (!coursework) {
      return new NextResponse("Coursework not found or unauthorized", { status: 404 });
    }

    // Validate required fields
    if (!coursework.title || !coursework.description || !coursework.courseId) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Publish
    const publishedCoursework = await prisma.coursework.update({
      where: { id: courseworkId },
      data: { isPublished: true },
    });

    return NextResponse.json(publishedCoursework);
  } catch (error) {
    console.error("[COURSEWORK_PUBLISH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}