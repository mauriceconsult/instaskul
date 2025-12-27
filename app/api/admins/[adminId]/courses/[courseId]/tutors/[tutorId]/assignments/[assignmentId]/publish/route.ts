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
      tutorId: string;
      assignmentId: string;
    }>;
  }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { adminId, courseId, tutorId, assignmentId } = await params;

    // Secure ownership: assignment → tutor → course → admin
    const assignment = await prisma.assignment.findUnique({
      where: {
        id: assignmentId,
        tutorId,
        tutor: {
          courseId,
          course: {
            adminId,
          },
        },
      },
    });

    if (!assignment) {
      return new NextResponse("Assignment not found or unauthorized", { status: 404 });
    }

    // Validate required fields
    if (!assignment.title || !assignment.description) {
      return new NextResponse("Title and description are required", { status: 400 });
    }

    // Publish the assignment
    const publishedAssignment = await prisma.assignment.update({
      where: { id: assignmentId },
      data: { isPublished: true },
    });

    return NextResponse.json(publishedAssignment);
  } catch (error) {
    console.error("[ASSIGNMENT_PUBLISH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}