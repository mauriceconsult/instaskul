// app/api/admins/[adminId]/courses/[courseId]/coursenoticeboards/[coursenoticeboardId]/publish/route.ts
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
      coursenoticeboardId: string;
    }>;
  }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { adminId, courseId, coursenoticeboardId } = await params;

    // Secure ownership: noticeboard → course → admin
    const courseNoticeboard = await prisma.courseNoticeboard.findUnique({
      where: {
        id: coursenoticeboardId,
        courseId,
        course: {
          adminId,  
        },
      },
    });

    if (!courseNoticeboard) {
      return new NextResponse("Noticeboard not found or unauthorized", { status: 404 });
    }

    // Validate required fields
    if (!courseNoticeboard.title || !courseNoticeboard.description) {
      return new NextResponse("Title and description are required", { status: 400 });
    }

    // Publish
    const publishedNoticeboard = await prisma.courseNoticeboard.update({
      where: { id: coursenoticeboardId },
      data: { isPublished: true },
    });

    return NextResponse.json(publishedNoticeboard);
  } catch (error) {
    console.error("[COURSE_NOTICEBOARD_PUBLISH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}