"use server";

import { prisma } from "@/lib/db";
import { Assignment, Attachment, Tutor } from "@prisma/client";

export type AssignmentWithProgressWithTutor = Assignment & {
  tutor: Tutor | null;
  attachments: Attachment[];
  progress: number; 
};

export type GetAssignmentsParams = {
  userId: string;
  title?: string;
  tutorId?: string;
};

export const getAssignments = async ({
  userId,
  title,
  tutorId,
}: GetAssignmentsParams): Promise<AssignmentWithProgressWithTutor[]> => {
  try {
    const assignments = await prisma.assignment.findMany({
      where: {
        isPublished: true,
        title: title
          ? { contains: title, mode: "insensitive" }
          : undefined,
        tutorId,
      },
      include: {
        tutor: true,
        attachments: {
          orderBy: { createdAt: "desc" },
        },
        userProgress: {
          where: { userId },
          select: { isCompleted: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return assignments.map((assignment) => {
      const isCompleted = assignment.userProgress.some((up) => up.isCompleted);
      const progress = isCompleted ? 100 : 0;

      return {
        ...assignment,
        progress,
      };
    });
  } catch (error) {
    console.error("[GET_ASSIGNMENTS]", error);
    return [];
  }
};