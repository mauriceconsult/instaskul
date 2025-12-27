import { prisma } from "@/lib/db";

export const getCourseProgress = async (
  userId: string,
  courseId: string
): Promise<number> => {
  try {
    const [publishedTutorsCount, completedTutorsCount] = await Promise.all([
      prisma.tutor.count({
        where: {
          courseId,
          isPublished: true,
        },
      }),
      prisma.userProgress.count({
        where: {
          userId,
          tutors: {
            courseId,
            isPublished: true,
          },
          isCompleted: true,
        },
      }),
    ]);

    if (publishedTutorsCount === 0) return 100; // No tutors → course complete

    return Math.round((completedTutorsCount / publishedTutorsCount) * 100);
  } catch (error) {
    console.error("[GET_COURSE_PROGRESS]", error);
    return 0;
  }
};