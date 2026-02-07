// app/api/courseworks/[courseworkId]/submit/route.ts
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: { courseworkId: string } }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { courseworkId } = params;
    const { content } = await req.json();

    if (!content || !content.trim()) {
      return new NextResponse("Content is required", { status: 400 });
    }

    // Verify coursework exists
    const coursework = await prisma.coursework.findUnique({
      where: {
        id: courseworkId,
        isPublished: true,
      },
      select: {
        id: true,
        courseId: true,
      },
    });

    if (!coursework || !coursework.courseId) {
      return new NextResponse("Coursework not found", { status: 404 });
    }

    // Verify user is enrolled in the course
    const enrollment = await prisma.tuition.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId: coursework.courseId,
        },
      },
    });

    if (!enrollment?.isPaid) {
      return new NextResponse("Not enrolled in course", { status: 403 });
    }

    // Check if user already has a submission
    const existingSubmission = await prisma.courseworkSubmission.findUnique({
      where: {
        courseworkId_userId: {
          courseworkId,
          userId,
        },
      },
    });

    let submission;

    if (existingSubmission) {
      // Update existing submission
      submission = await prisma.courseworkSubmission.update({
        where: {
          courseworkId_userId: {
            courseworkId,
            userId,
          },
        },
        data: {
          text: content,
          submittedAt: new Date(),
          // Reset grading when resubmitting
          isGraded: false,
          grade: null,
          feedback: null,
        },
      });
    } else {
      // Create new submission
      submission = await prisma.courseworkSubmission.create({
        data: {
          courseworkId,
          userId,
          text: content,
          submittedAt: new Date(),
        },
      });
    }

    return NextResponse.json(submission);
  } catch (error) {
    console.error("[COURSEWORK_SUBMIT]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
