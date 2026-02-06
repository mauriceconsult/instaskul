// actions/get-coursework.ts
import { prisma } from "@/lib/db";
import { Coursework, Attachment, Course, UserProgress } from "@prisma/client";

export type CourseworkWithRelations = Coursework & {
  course: Course | null;
  attachments: Attachment[];
  userProgress?: UserProgress | null;
  courseworkProgress?: number;
};

interface GetCourseworkParams {
  userId: string;
  courseId: string;
  courseworkId: string;
}

export async function getCoursework({
  userId,
  courseId,
  courseworkId,
}: GetCourseworkParams): Promise<CourseworkWithRelations> {
  try {
    const coursework = await prisma.coursework.findUnique({
      where: {
        id: courseworkId,
        courseId,
        course: {
          isPublished: true,
        },
      },
      include: {
        course: true,
        attachments: {
          orderBy: { createdAt: "desc" },
        },
        userProgress: {
          where: { userId },
          take: 1,
        },
      },
    });

    if (!coursework) {
      throw new Error("Coursework not found or not accessible");
    }

    // Calculate simple progress (0–100) based on completion
    const progress = coursework.userProgress?.[0]?.isCompleted ? 100 : 0;

    return {
      ...coursework,
      userProgress: coursework.userProgress?.[0] ?? null,
      courseworkProgress: progress,
    };
  } catch (error) {
    console.error("[GET_COURSEWORK]", error);
    throw error; // Let page handle redirect
  }
}