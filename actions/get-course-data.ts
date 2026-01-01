"use server";

import { prisma } from "@/lib/db";
import { getCourseProgress } from "./get-course-progress";
import { CourseWithProgressWithAdmin } from "./get-courses";

interface GetCourseDataParams {
  userId: string;
  courseId: string;
}

export const getCourseData = async ({
  userId,
  courseId,
}: GetCourseDataParams): Promise<CourseWithProgressWithAdmin | null> => {
  try {
    const course = await prisma.course.findUnique({
      where: {
        id: courseId,
        isPublished: true,
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
    });

    if (!course) {
      return null;
    }

    const progress: number = await getCourseProgress(userId, courseId);
    const tuition = course.tuitions[0] || null;
    const freeTutorialsCount = course.tutors.filter(t => t.isFree).length;

    const courseWithProgressWithAdmin: CourseWithProgressWithAdmin = {
      ...course,
      admin: course.admin,
      tutors: course.tutors.map((tutor) => ({
        id: tutor.id,
        title: tutor.title,
        position: tutor.position,
        isFree: tutor.isFree,
        muxData: tutor.muxData,
      })),
      progress,
      tuition,
      freeTutorialsCount, // ← Add this
    };

    return courseWithProgressWithAdmin;
  } catch (error) {
    console.error("[GET_COURSE_DATA]", error);
    return null;
  }
};