import { prisma } from "@/lib/db";
import { Course, Tuition } from "@prisma/client";

interface CourseEarnings {
  name: string;
  total: number;
}

interface AnalyticsData {
  data: CourseEarnings[];
  totalRevenue: number;
  totalSales: number;
  totalPublishedAdmins: number;
}

export const getAnalytics = async (userId: string): Promise<AnalyticsData> => {
  try {
    // 1. Fetch all tuitions + courses for this user
    const tuitions = await prisma.tuition.findMany({
      where: {
        course: {
          userId,
        },
      },
      include: {
        course: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // 2. Calculate earnings per course (sum of course.amount per title)
    const earningsByCourse = tuitions.reduce<Record<string, number>>((acc, tuition) => {
      const title = tuition.course?.title ?? "Untitled Course";
      const amount = Number(tuition.course?.amount) || 0;

      acc[title] = (acc[title] || 0) + amount;
      return acc;
    }, {});

    // 3. Format for chart/data display
    const data: CourseEarnings[] = Object.entries(earningsByCourse).map(([name, total]) => ({
      name,
      total,
    }));

    // 4. Totals
    const totalRevenue = data.reduce((sum, item) => sum + item.total, 0);
    const totalSales = tuitions.length;

    // 5. Bonus: count published admins (common dashboard metric)
    const totalPublishedAdmins = await prisma.admin.count({
      where: {
        userId,
        isPublished: true,
      },
    });

    return {
      data,
      totalRevenue,
      totalSales,
      totalPublishedAdmins,
    };
  } catch (error) {
    console.error("[GET_ANALYTICS]", error);
    return {
      data: [],
      totalRevenue: 0,
      totalSales: 0,
      totalPublishedAdmins: 0,
    };
  }
};