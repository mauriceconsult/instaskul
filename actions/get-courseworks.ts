"use server";

import { prisma } from "@/lib/db";
import { Coursework, Attachment, Course } from "@prisma/client";
import { getCourseworkProgress } from "./get-coursework-progress";

export type CourseworkWithProgressWithCourse = Coursework & {
  course: Course | null;
  attachments: Attachment[];
  progress: number | null;
};

export type GetCourseworksParams = {
  userId: string;
  title?: string;
  courseId?: string;
};

export const getCourseworks = async ({
  userId,
  title,
  courseId,
}: GetCourseworksParams): Promise<CourseworkWithProgressWithCourse[]> => {
  try {
    const courseworks = await prisma.coursework.findMany({
      where: {
        isPublished: true,
        title: title
          ? { contains: title, mode: "insensitive" }
          : undefined,
        courseId,
      },
      include: {
        course: true,
        attachments: {
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const courseworksWithProgress = await Promise.all(
      courseworks.map(async (coursework) => {
        const progress = coursework.courseId
          ? await getCourseworkProgress(userId, coursework.courseId)
          : 0;

        return {
          ...coursework,
          progress,
        };
      })
    );

    return courseworksWithProgress;
  } catch (error) {
    console.error("[GET_COURSEWORKS]", error);
    return [];
  }
};