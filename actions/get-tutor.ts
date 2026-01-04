import { prisma } from "@/lib/db";

interface GetTutorProps {
  userId: string;
  courseId: string;
  tutorId: string;
}

export const getTutor = async ({
  userId,
  courseId,
  tutorId,
}: GetTutorProps) => {
  try {
    // Get tutorial
    const tutorial = await prisma.tutor.findUnique({
      where: {
        id: tutorId,
        courseId,
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
            amount: true,
            isPublished: true,
          },
        },
      },
    });

    if (!tutorial || !tutorial.course || !tutorial.course.isPublished) {
      throw new Error("Tutorial not found or course not published");
    }

    // Check enrollment
    const tuition = await prisma.tuition.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
    });

    // Get MuxData if free or enrolled
    let muxData = null;
    if (tutorial.isFree || tuition) {
      muxData = await prisma.muxData.findUnique({
        where: { tutorId },
      });
    }

    // Get next tutorial
    const nextTutorial = await prisma.tutor.findFirst({
      where: {
        courseId,
        isPublished: true,
        position: { gt: tutorial.position },
      },
      orderBy: { position: "asc" },
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