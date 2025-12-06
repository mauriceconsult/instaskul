"use server";

import { prisma } from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";
import { CourseWithProgressWithAdmin } from "./get-courses";

export async function getAdminData(adminId: string) {
  const user = await currentUser();
  if (!user) {
    console.error("[GET_ADMIN_DATA_ERROR] User not authenticated");
    throw new Error("User not authenticated");
  }

  const admin = await prisma.admin.findUnique({
    where: { id: adminId },
    include: {
      courses: {
        include: {
          admin: true,
          tutors: {
            select: {
              id: true,
              title: true,
              isPublished: true,
              isFree: true,
              position: true,
              playbackId: true,
            },
          },
          tuitions: {
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
            select: {
              id: true,
              userId: true,
              adminId: true,
              courseId: true,
              tutorId: true,
              courseworkId: true,
              assignmentId: true,
              isEnrolled: true,
              isCompleted: true,
              createdAt: true,
              updatedAt: true,
            },
          },
        },
      },
    },
  });

  if (!admin) {
    console.error("[GET_ADMIN_DATA_ERROR] Admin not found");
    throw new Error("Admin not found");
  }

  const courses: CourseWithProgressWithAdmin[] = admin.courses.map((course) => {
    const totalTutors: number = course.tutors.length;
    const completedTutors: number = course.userProgress.filter(
      (progress) => progress.isCompleted
    ).length;
    const progress: number =
      totalTutors > 0 ? (completedTutors / totalTutors) * 100 : 0;

    return {
      ...course,
      admin: course.admin,
      tutors: course.tutors,
      progress,
      tuition:
        course.tuitions.find(
          (t) => t.userId === user.id || t.enrolleeUserId === user.id
        ) || null,
      userProgress: course.userProgress,
      tuitions: course.tuitions,
    };
  });

  console.log(`[getAdminData] Admin response:`, { adminId, courses });
  return { adminId, courses };
}
