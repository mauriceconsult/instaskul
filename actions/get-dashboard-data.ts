import { prisma } from "@/lib/db";
import { getCourseProgress } from "./get-course-progress";

// actions/get-dashboard-data.ts
export interface DashboardStats {
  adminsInProgress: number;
  liveAdmins: number;
  coursesInProgress: number;
  completedCourses: number;
}

export const getDashboardData = async (userId: string): Promise<DashboardStats> => {
  try {
    // Fetch admins
    const admins = await prisma.admin.findMany({
      where: { userId },
      select: { isPublished: true },
    });

    const liveAdmins = admins.filter(a => a.isPublished).length;
    const adminsInProgress = admins.length - liveAdmins; // or your real logic

    // Fetch purchased courses with progress
    const purchasedCourses = await prisma.course.findMany({
      where: {
        tuitions: { some: { userId } },
      },
      select: { id: true },
    });

    let coursesInProgress = 0;
    let completedCourses = 0;

    await Promise.all(
      purchasedCourses.map(async ({ id }) => {
        const progress = await getCourseProgress(userId, id);
        if (progress === 100) {
          completedCourses++;
        } else if (progress > 0) {
          coursesInProgress++;
        }
      })
    );

    return {
      adminsInProgress,
      liveAdmins,
      coursesInProgress,
      completedCourses,
    };
  } catch (error) {
    console.error("[GET_DASHBOARD_DATA]", error);
    return {
      adminsInProgress: 0,
      liveAdmins: 0,
      coursesInProgress: 0,
      completedCourses: 0,
    };
  }
};