"use server";

import { prisma } from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";
import { CourseWithProgressWithAdmin } from "./get-courses";
import { getCourseProgress } from "./get-course-progress";

export async function getCourseData(
  courseId: string
): Promise<CourseWithProgressWithAdmin | null> {
  const user = await currentUser();
  if (!user) {
    console.error("[GET_COURSE_DATA_ERROR] User not authenticated");
    throw new Error("User not authenticated");
  }

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      admin: true,
   tutors: {
  where: { isPublished: true },
  select: {
    id: true,
    title: true,
    isPublished: true,
    isFree: true,
    position: true,
    muxData: {
      select: {
        playbackId: true,
      },
    },
  },
},

      tuitions: {
        where: { userId: user.id },
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
        where: { userId: user.id },
        select: {
          id: true,
          userId: true,
          courseId: true,
          tutorId: true,
          courseworkId: true,
          assignmentId: true,
          adminId: true,
          isEnrolled: true,
          isCompleted: true,
          createdAt: true,
          updatedAt: true,
        },
      },
    },
  });

  if (!course) {
    console.error("[GET_COURSE_DATA_ERROR] Course not found");
    return null;
  }

  const progress: number = await getCourseProgress(user.id, courseId);
  const courseWithProgressWithAdmin: CourseWithProgressWithAdmin = {
    ...course,
    admin: course.admin,
    tutors: course.tutors.map((tutor) => ({
  id: tutor.id,
  title: tutor.title,
  position: tutor.position,
  isFree: tutor.isFree ?? false, // 🔑 normalize null → boolean
  muxData: tutor.muxData,
})),
    progress,
    tuition:
      course.tuitions.find(
        (t) => t.userId === user.id || t.enrolleeUserId === user.id
      ) || null,
    userProgress: course.userProgress,
    tuitions: course.tuitions,
  };

  console.log(`[getCourseData] Course response:`, {
    courseId,
    course: courseWithProgressWithAdmin,
  });
  return courseWithProgressWithAdmin;
}
