"use server";

import { prisma } from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";
import { CourseWithProgressWithAdmin } from "./get-courses";

export async function getAdminData(adminId: string) {
  const user = await currentUser();
  if (!user) {
    throw new Error("User not authenticated");
  }

  const admin = await prisma.admin.findUnique({
    where: { id: adminId },
    include: {
      courses: {
        where: { isPublished: true },
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
},


          tuitions: {
            where: {
              OR: [
                { userId: user.id },
                { enrolleeUserId: user.id },
              ],
            },
          },

          userProgress: {
            where: { userId: user.id },
            select: {
              isCompleted: true,
            },
          },
        },
      },
    },
  });

  if (!admin || !admin.courses) {
    throw new Error("Admin or courses not found");
  }

  const courses: CourseWithProgressWithAdmin[] = admin.courses.map((course) => {
    const totalTutors = course.tutors.length;
    const completedTutors = course.userProgress.filter(
      (p) => p.isCompleted
    ).length;

    const progress =
      totalTutors > 0
        ? Math.round((completedTutors / totalTutors) * 100)
        : 0;

    const tuition = course.tuitions[0] ?? null;

    return {
      ...course,
      progress,
      tuition,
    } as CourseWithProgressWithAdmin;
  });

  return { adminId, courses };
}
