import { prisma } from "@/lib/db";
import { Coursework, Attachment, Course } from "@prisma/client";


export type CourseworkWithRelations = Coursework & {
  course: Course | null;
  attachments: Attachment[];
  getCourseworkProgress?: number;
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
}: GetCourseworksParams): Promise<CourseworkWithRelations[]> => {
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
      orderBy: {
        createdAt: "desc",
      },
    });

    return courseworks;
  } catch (error) {
    console.error("[GET_COURSEWORKS]", error);
    return [];
  }
};