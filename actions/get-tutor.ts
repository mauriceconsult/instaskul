import { prisma } from "@/lib/db";

interface GetTutorProps {
  userId: string;
  adminId: string;
  courseId: string;
  tutorId: string;
}

export const getTutor = async ({
  userId,
  adminId,
  courseId,
  tutorId,
}: GetTutorProps) => {
  try {
    // Get tutorial first to verify it exists
    const tutorial = await prisma.tutor.findUnique({
      where: {
        id: tutorId,
        isPublished: true,
      },
      include: {
        assignments: {
          where: { isPublished: true },
          orderBy: { position: "asc" },
        },
        attachments: {
          orderBy: { createdAt: "desc" },
        },
        course: {
          select: {
            id: true,
            adminId: true,
            amount: true,
            isPublished: true,
          },
        },
      },
    });

    if (!tutorial || !tutorial.course) {
      throw new Error("Tutorial not found or not published");
    }

    // Verify the course matches the URL parameters
    if (tutorial.course.id !== courseId) {
      throw new Error("Tutorial does not belong to this course");
    }

    // Verify the admin matches (if provided)
    if (adminId && tutorial.course.adminId !== adminId) {
      throw new Error("Course does not belong to this admin");
    }

    if (!tutorial.course.isPublished) {
      throw new Error("Course is not published");
    }

    // Check if user has enrolled/purchased
    const tuition = await prisma.tuition.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId: tutorial.course.id,
        },
      },
    });

    // Get MuxData if tutorial is free or user enrolled
    let muxData = null;
    if (tutorial.isFree || tuition) {
      muxData = await prisma.muxData.findUnique({
        where: {
          tutorId: tutorId,
        },
      });
    }

    // Get next tutorial
    const nextTutorial = await prisma.tutor.findFirst({
      where: {
        courseId: tutorial.course.id,
        isPublished: true,
        position: {
          gt: tutorial.position,
        },
      },
      orderBy: {
        position: "asc",
      },
    });

    // Get user progress
    const userProgress = await prisma.userProgress.findUnique({
      where: {
        userId_tutorId: {
          userId,
          tutorId,
        },
      },
    });

    return {
      tutorial,
      course: tutorial.course,
      muxData,
      assignments: tutorial.assignments,
      attachments: tutorial.attachments,
      nextTutorial,
      userProgress,
      tuition,
    };
  } catch (error) {
    console.log("[GET_TUTOR_ERROR]", error);
    return {
      tutorial: null,
      course: null,
      muxData: null,
      attachments: [],
      assignments: [],
      nextTutorial: null,
      userProgress: null,
      tuition: null,
    };
  }
};