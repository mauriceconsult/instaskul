// app/api/admins/[adminId]/courses/[courseId]/tutors/[tutorId]/publish/route.ts
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
    }>;
  }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { adminId, courseId, tutorId } = await params;

    // Find tutor with ownership check via course.adminId
    const tutor = await prisma.tutor.findUnique({
      where: {
        id: tutorId,
        courseId,
        course: {
          adminId,  
        },
      },
      include: {
        assignments: {
          where: { isPublished: true },
        },
      },
    });

    if (!tutor) {
      return new NextResponse("Tutorial not found or unauthorized", { status: 404 });
    }

    // Validate required fields
    if (
      !tutor.title ||
      !tutor.description ||
      !tutor.videoUrl ||
      tutor.assignments.length === 0
    ) {
      return new NextResponse(
        "Missing required fields (title, description, video) or no published assignments",
        { status: 400 }
      );
    }

    // Publish the tutorial
    const publishedTutor = await prisma.tutor.update({
      where: { id: tutorId },
      data: { isPublished: true },
    });

    return NextResponse.json(publishedTutor);
  } catch (error) {
    console.error("[TUTOR_PUBLISH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}