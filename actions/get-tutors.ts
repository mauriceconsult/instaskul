import { prisma } from "@/lib/db";
import { Tutor, Course, Attachment } from "@prisma/client";

export type TutorWithProgressWithCourse = Tutor & {
  course: Course | null;
  attachments: Attachment[];
  assignmentsCount: number; // Number of assignments
  progress: number; // 0 or 100
};

export type GetTutorsParams = {
  userId: string;
  title?: string;
  courseId?: string;
};

export const getTutors = async ({
  userId,
  title,
  courseId,
}: GetTutorsParams): Promise<TutorWithProgressWithCourse[]> => {
  try {
    const tutors = await prisma.tutor.findMany({
      where: {
        isPublished: true,
        title: title
          ? { contains: title, mode: "insensitive" }
          : undefined,
        courseId,
      },
      include: {
        course: true,
        attachments: true,
        assignments: {
          where: { isPublished: true },
          select: { id: true },
        },
        userProgress: {
          where: { userId },
          select: { isCompleted: true },
        },
      },
      orderBy: { position: "asc" },
    });

    return tutors.map((tutor) => ({
      ...tutor,
      assignmentsCount: tutor.assignments.length,
      progress: tutor.userProgress.some((up) => up.isCompleted) ? 100 : 0,
    }));
  } catch (error) {
    console.error("[GET_TUTORS]", error);
    return [];
  }
};