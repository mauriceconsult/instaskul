"use server";

import { prisma } from "@/lib/db";
import { Admin, Course, Tuition, UserProgress, Tutor } from "@prisma/client";
import { getCourseProgress } from "./get-course-progress";

export interface CourseWithProgressWithAdmin extends Course {
  admin: Admin | null;
  tutors: {
    id: string;
    title: string;
    isFree: boolean;
    position: number;
    muxData?: {
      playbackId: string | null;
    } | null;
  }[];
  progress: number | null;
  tuition: Tuition | null;
  tuitions: Tuition[];
  userProgress: UserProgress[];
}


export type GetCoursesParams = {
  userId: string;
  title?: string;
  adminId?: string;
};

export const getCourses = async ({
  userId,
  title,
  adminId,
}: GetCoursesParams): Promise<CourseWithProgressWithAdmin[]> => {
  try {
    const courses = await prisma.course.findMany({
      where: {
        isPublished: true,
        title: title
          ? { contains: title, mode: "insensitive" }
          : undefined,
        adminId,
      },
      include: {
        admin: true,
        tutors: {
          where: { isPublished: true },
        select: {
  id: true,
  title: true,
  isFree: true,
  position: true,
  muxData: {
    select: {
      playbackId: true,
    },
  },
},

          orderBy: { position: "asc" },
        },
        tuitions: {
          where: {
            OR: [{ userId }, { enrolleeUserId: userId }],
          },
        },
        userProgress: {
          where: { userId },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const coursesWithProgress = await Promise.all(
      courses.map(async (course) => {
        const progress = await getCourseProgress(userId, course.id);

        const tuition = course.tuitions[0] || null; // First matching tuition

        return {
          ...course,
          progress,
          tuition,
        };
      })
    );

    return coursesWithProgress;
  } catch (error) {
    console.error("[GET_COURSES]", error);
    return [];
  }
};