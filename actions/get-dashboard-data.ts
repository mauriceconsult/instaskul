// actions/get-dashboard-data.ts
import { prisma } from "@/lib/db";
import { Admin, Course, UserProgress } from "@prisma/client";

type AdminWithProgress = Admin & { userProgress: UserProgress[] };
type CourseWithProgress = Course & { userProgress: UserProgress[] };

export async function getDashboardData(): Promise<{
  adminsInProgress: number;
  completedAdmins: number;
  coursesInProgress: number;
  completedCourses: number;
}> {
  try {
    const admins = await prisma.admin.findMany({
      where: { isPublished: true },
      include: { userProgress: true },
    });

    const courses = await prisma.course.findMany({
      where: { isPublished: true },
      include: { userProgress: true },
    });

    const adminsInProgress = admins.filter((admin) =>
      admin.userProgress.some((p) => !p.isCompleted)
    ).length;

    const completedAdmins = admins.filter((admin) =>
      admin.userProgress.length > 0 && admin.userProgress.every((p) => p.isCompleted)
    ).length;

    const coursesInProgress = courses.filter((course) =>
      course.userProgress.some((p) => !p.isCompleted)
    ).length;

    const completedCourses = courses.filter((course) =>
      course.userProgress.length > 0 && course.userProgress.every((p) => p.isCompleted)
    ).length;

    return {
      adminsInProgress,
      completedAdmins,
      coursesInProgress,
      completedCourses,
    };
  } catch (error) {
    console.error("Database query failed:", error);
    return {
      adminsInProgress: 0,
      completedAdmins: 0,
      coursesInProgress: 0,
      completedCourses: 0,
    };
  }
}