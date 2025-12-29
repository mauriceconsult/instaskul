// actions/get-coursework-progress.ts
import { prisma } from "@/lib/db";

export const getCourseworkProgress = async (
  userId: string,
  courseId: string
): Promise<number> => {
  try {
    const [publishedCount, completedCount] = await Promise.all([
      prisma.coursework.count({
        where: {
          courseId,
          isPublished: true,
        },
      }),
      prisma.userProgress.count({
        where: {
          userId,
          courseworks: {
            courseId,
            isPublished: true,
          },
          isCompleted: true,
        },
      }),
    ]);

    if (publishedCount === 0) return 0; // ← Changed: No coursework = 0% (not complete)

    return Math.round((completedCount / publishedCount) * 100);
  } catch (error) {
    console.error("[GET_COURSEWORK_PROGRESS]", error);
    return 0;
  }
};