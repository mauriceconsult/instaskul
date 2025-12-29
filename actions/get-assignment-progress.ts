// actions/get-assignment-progress.ts
import { prisma } from "@/lib/db";

export const getAssignmentProgress = async (
  userId: string,
  tutorId: string
): Promise<number> => {
  try {
    const [publishedCount, completedCount] = await Promise.all([
      prisma.assignment.count({
        where: {
          tutorId,
          isPublished: true,
        },
      }),
      prisma.userProgress.count({
        where: {
          userId,
          assignments: {
            tutorId,
            isPublished: true,
          },
          isCompleted: true,
        },
      }),
    ]);

    if (publishedCount === 0) return 0; // ← Changed: No assignments = 0% (not complete)

    return Math.round((completedCount / publishedCount) * 100);
  } catch (error) {
    console.error("[GET_ASSIGNMENT_PROGRESS]", error);
    return 0;
  }
};