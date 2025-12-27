import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ adminId: string; courseId: string; coursenoticeboardId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    const coursenoticeboard = await prisma.courseNoticeboard.findUnique({
      where: {
        id: (await params).coursenoticeboardId,
            userId: userId,
        courseId: (await params).courseId,
      },
    });
    if (!coursenoticeboard) {
      return new NextResponse("Not found", { status: 404 });
    }
    const deletedCourseNoticeboard = await prisma.courseNoticeboard.delete({
      where: {
        id: (await params).coursenoticeboardId,
      },
    });
    return NextResponse.json(deletedCourseNoticeboard);
  } catch (error) {
    console.log("[COURSE_NOTICEBOARD_ID_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
    { params }: { params: Promise<{ adminId: string; courseId: string; coursenoticeboardId: string }> }
) {
  try {
    const { userId } = await auth();
    const { adminId, courseId, coursenoticeboardId } = await params;
    const values = await req.json();
    if (!userId) {
      return new NextResponse("Unathorized", { status: 401 });
    }
    const coursenoticeboard = await prisma.courseNoticeboard.update({
      where: {
        id: coursenoticeboardId,
            userId,
        courseId,
        course: { adminId },
      },
      data: {
        ...values,
      },
    });
    return NextResponse.json(coursenoticeboard);
  } catch (error) {
    console.log("[COURSE_NOTICEBOARD_ID]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
