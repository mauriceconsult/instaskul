import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function DELETE(
  req: Request,
    { params }: { params: Promise<{ adminId: string; courseId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    const course = await prisma.course.findUnique({
      where: {
        id: (await params).courseId,
            userId: userId,
        adminId: (await params).adminId,
      },
    });
    if (!course) {
      return new NextResponse("Not found", { status: 404 });
    }
    const deletedCourse = await prisma.course.delete({
      where: {
        id: (await params).courseId,
      },
    });
    return NextResponse.json(deletedCourse);
  } catch (error) {
    console.log("[COURSE_ID_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
    { params }: { params: Promise<{ adminId: string; courseId: string }> }
) {
  try {
    const { userId } = await auth();
    const { adminId, courseId } = await params;
    const values = await req.json();
    if (!userId) {
      return new NextResponse("Unathorized", { status: 401 });
    }
    const course = await prisma.course.update({
      where: {
        id: courseId,
            userId,
        adminId,
      },
      data: {
        ...values,
      },
    });
    return NextResponse.json(course);
  } catch (error) {
    console.log("[COURSE_ID]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
