// actions/get-dashboard-data.ts (Creator-Focused Version)
import { prisma } from "@/lib/db";

export interface DashboardStats {
  adminsInProgress: number;
  liveAdmins: number;
  coursesInProgress: number;
  completedCourses: number;
}

export const getDashboardData = async (userId: string): Promise<DashboardStats> => {
  try {
    // Fetch user's admins with their courses
    const userAdmins = await prisma.admin.findMany({
      where: { userId },
      include: {
        courses: {
          select: {
            id: true,
            isPublished: true,
          },
        },
      },
    });

    // Count admins
    const liveAdmins = userAdmins.filter((a) => a.isPublished).length;
    const adminsInProgress = userAdmins.length - liveAdmins;

    // Get all courses from user's admins
    const allCourses = userAdmins.flatMap((admin) =>
      admin.courses.map((course) => ({
        courseId: course.id,
        courseIsPublished: course.isPublished,
        adminIsPublished: admin.isPublished,
      }))
    );

    // ✅ Courses in progress: Not published OR admin not published
    const coursesInProgress = allCourses.filter(
      (c) => !c.courseIsPublished || !c.adminIsPublished
    ).length;

    // ✅ Live courses: Both course AND admin are published
    const completedCourses = allCourses.filter(
      (c) => c.courseIsPublished && c.adminIsPublished
    ).length;

    console.log("[DASHBOARD_DATA] Creator Stats:", {
      userId,
      totalAdmins: userAdmins.length,
      liveAdmins,
      adminsInProgress,
      totalCourses: allCourses.length,
      completedCourses,
      coursesInProgress,
      breakdown: {
        publishedCoursesInPublishedAdmins: completedCourses,
        unpublishedCourses: allCourses.filter((c) => !c.courseIsPublished).length,
        publishedCoursesInUnpublishedAdmins: allCourses.filter(
          (c) => c.courseIsPublished && !c.adminIsPublished
        ).length,
      },
    });

    return {
      adminsInProgress,
      liveAdmins,
      coursesInProgress,
      completedCourses,
    };
  } catch (error) {
    console.error("[GET_DASHBOARD_DATA] Error:", error);
    return {
      adminsInProgress: 0,
      liveAdmins: 0,
      coursesInProgress: 0,
      completedCourses: 0,
    };
  }
};
