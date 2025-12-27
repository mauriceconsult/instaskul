import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ adminId: string; courseId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    const ownAdmin = await prisma.admin.findUnique({
      where: {
        id: (await params).adminId,
        userId,
      },
    });
    if (!ownAdmin) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const unpublishedCourse = await prisma.course.update({
      where: {
        id: (await params).courseId,
        adminId: (await params).adminId,
      },
      data: {
        isPublished: false,
      },
    });
    const publishedCoursesInAdmin = await prisma.course.findMany({
      where: {
        adminId: (await params).adminId,
        isPublished: true,
      },
    });
    if (!publishedCoursesInAdmin.length) {
      await prisma.admin.update({
        where: {
          id: (await params).adminId,
        },
        data: {
          isPublished: false,
        },
      });
    }
    return NextResponse.json(unpublishedCourse);
  } catch (error) {
    console.log("[COURSE_UNPUBLISH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
