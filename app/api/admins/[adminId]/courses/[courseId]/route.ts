import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ adminId: string; courseId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { courseId } = await params;
    const body = await req.json();

    // Verify ownership
    const course = await prisma.course.findUnique({
      where: { id: courseId, userId },
    });

    if (!course) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Update course
    const updatedCourse = await prisma.course.update({
      where: { id: courseId },
      data: body, 
    });

    return NextResponse.json(updatedCourse);
  } catch (error) {
    console.log("[COURSE_PATCH]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ adminId: string; courseId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { courseId } = await params;

    const course = await prisma.course.findUnique({
      where: { id: courseId, userId },
      include: {
        tutors: { where: { isPublished: true }, include: { muxData: true } },
      },
    });

    if (!course) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const deletedCourse = await prisma.course.delete({
      where: { id: courseId },
    });

    return NextResponse.json(deletedCourse);
  } catch (error) {
    console.log("[COURSE_DELETE]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
