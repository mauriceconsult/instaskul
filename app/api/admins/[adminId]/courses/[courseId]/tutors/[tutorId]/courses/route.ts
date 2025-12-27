import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  {
    params,
  }: {
    params: Promise<{ adminId: string; courseId: string; tutorId: string }>;
  }
) {
  try {
    const { userId } = await auth();
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const { adminId, courseId, tutorId } = await params;
    const { courseId: newCourseId } = await req.json();

    if (!newCourseId) {
      return new NextResponse("Course ID is required", { status: 400 });
    }

    // Secure ownership: tutor → course → admin
    const tutor = await prisma.tutor.findUnique({
      where: {
        id: tutorId,
        courseId,
        course: { adminId },
      },
    });

    if (!tutor) {
      return new NextResponse("Tutorial not found or unauthorized", { status: 404 });
    }

    // Verify new course belongs to same admin
    const targetCourse = await prisma.course.findUnique({
      where: { id: newCourseId, adminId },
    });

    if (!targetCourse) {
      return new NextResponse("Target course not found or unauthorized", { status: 404 });
    }

    const updatedTutor = await prisma.tutor.update({
      where: { id: tutorId },
      data: { courseId: newCourseId },
    });

    return NextResponse.json(updatedTutor);
  } catch (error) {
    console.error("[TUTOR_COURSE_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}