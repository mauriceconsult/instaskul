import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server.js";

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
    const ownCourseNoticeboard = await prisma.courseNoticeboard.findUnique({
      where: {
        id: (await params).coursenoticeboardId,
        userId,
      },
    });
    if (!ownCourseNoticeboard) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    const unpublishedCourseNoticeboard = await prisma.courseNoticeboard.update({
      where: {
        id: (await params).coursenoticeboardId,
        userId,
      },
      data: {
        isPublished: false,
      },
    });
    const publishedCourseNoticeboard = await prisma.courseNoticeboard.findMany({
      where: {
        id: (await params).coursenoticeboardId,
        isPublished: true,
      },
    });
    if (!publishedCourseNoticeboard.length) {
      await prisma.course.update({
        where: {
          id: (await params).courseId,
        },
        data: {
          isPublished: false,
        },
      });
    }
    return NextResponse.json(unpublishedCourseNoticeboard);
  } catch (error) {
    console.log("[COURSE_NOTICEBOARD_UNPUBLISH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
