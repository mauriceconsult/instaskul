import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function PATCH(
  request: Request,
  {
    params,
  }: {
    params: Promise<{ adminId: string; courseId: string }>;
  }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { adminId, courseId } = await params;

    // Single query: find course with ownership and required relations
    const course = await prisma.course.findUnique({
      where: {
        id: courseId,
        adminId,  // Direct foreign key check
      },
      include: {
        tutors: {
          where: { isPublished: true },
          select: { id: true }, // Only need to check existence
        },
      },
    });

    if (!course) {
      return new NextResponse("Course not found or unauthorized", { status: 404 });
    }

    // Validate required fields
    if (
      !course.title ||
      !course.description ||
      !course.imageUrl ||
      !course.amount ||
      course.tutors.length === 0
    ) {
      return new NextResponse(
        "Missing required fields or no published tutorials",
        { status: 400 }
      );
    }

    // Publish the course
    const publishedCourse = await prisma.course.update({
      where: { id: courseId },
      data: { isPublished: true },
    });

    return NextResponse.json(publishedCourse);
  } catch (error) {
    console.error("[COURSE_PUBLISH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}