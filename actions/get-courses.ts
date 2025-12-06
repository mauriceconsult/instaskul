"use server";

import { Admin, Course, Tuition, UserProgress, Tutor } from "@prisma/client";
import { getProgress } from "./get-progress";
import { prisma } from "@/lib/db";

export interface CourseWithProgressWithAdmin extends Course {
  admin: Admin | null;
  tutors: Pick<Tutor, "id" | "title" | "isFree" | "position" | "playbackId">[];
  progress: number | null;
  tuition: Tuition | null;
  userProgress: UserProgress[];
  tuitions: Tuition[];
}

export type GetCourses = {
  userId: string;
  title?: string;
  adminId?: string;
};

export const getCourses = async ({
  userId,
  title,
  adminId,
}: GetCourses): Promise<CourseWithProgressWithAdmin[]> => {
  try {
    const courses = await prisma.course.findMany({
      where: {
        isPublished: true,
        title: {
          contains: title,
          mode: "insensitive",
        },
        adminId,
      },
      include: {
        admin: true,
        tutors: {
          where: {
            isPublished: true,
          },
          select: {
            id: true,
            title: true,
            isFree: true,
            position: true,
            playbackId: true,
          },
        },
        tuitions: {
          where: { userId },
          select: {
            id: true,
            userId: true,
            enrolleeUserId: true,
            courseId: true,
            amount: true,
            status: true,
            partyId: true,
            username: true,
            transactionId: true,
            isActive: true,
            isPaid: true,
            transId: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        userProgress: {
          where: { userId },
          select: {
            id: true,
            userId: true,
            createdAt: true,
            updatedAt: true,
            courseId: true,
            adminId: true,
            tutorId: true,
            courseworkId: true,
            assignmentId: true,
            isEnrolled: true,
            isCompleted: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const coursesWithProgress: CourseWithProgressWithAdmin[] =
      await Promise.all(
        courses.map(async (course) => {
          const progress: number = await getProgress(userId, course.id);
          return {
            ...course,
            admin: course.admin,
            tutors: course.tutors,
            progress,
            tuition:
              course.tuitions.find(
                (t) => t.userId === userId || t.enrolleeUserId === userId
              ) || null,
            userProgress: course.userProgress,
            tuitions: course.tuitions,
          };
        })
      );

    return coursesWithProgress;
  } catch (error) {
    console.log("[GET_COURSES]", error);
    return [];
  }
};
