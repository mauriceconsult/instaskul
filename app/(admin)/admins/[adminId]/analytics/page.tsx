// app/admins/[adminId]/analytics/page.tsx
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import AnalyticsClient from "./_components/analytics-client";

export default async function AnalyticsPage({
  params,
}: {
  params: Promise<{ adminId: string }>;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { adminId } = await params;

  // Verify ownership
  const admin = await prisma.admin.findUnique({
    where: {
      id: adminId,
      userId,
    },
    select: { 
      id: true,
      title: true,
    },
  });

  if (!admin) redirect("/dashboard/admins");

  // Fetch analytics data
  const [courses, enrollments, revenue] = await Promise.all([
    // Courses with stats
    prisma.course.findMany({
      where: { adminId },
      include: {
        _count: {
          select: {
            tuitions: true,
            tutors: true,
          },
        },
      },
    }),

    // Recent enrollments (last 30 days)
    prisma.tuition.findMany({
      where: {
        course: { adminId },
        isPaid: true,
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        },
      },
      include: {
        course: {
          select: {
            title: true,
            amount: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    }),

    // Total revenue
    prisma.tuition.findMany({
      where: {
        course: { adminId },
        isPaid: true,
      },
      select: {
        course: {
          select: {
            amount: true,
          },
        },
      },
    }),
  ]);

  // Calculate stats
  const totalEnrollments = enrollments.length;
  const totalRevenue = revenue.reduce(
    (sum, tuition) => sum + (Number(tuition.course?.amount) || 0),
    0
  );

  const courseStats = courses.map((course) => ({
    id: course.id,
    title: course.title,
    enrollments: course._count.tuitions,
    tutorials: course._count.tutors,
    revenue: course._count.tuitions * (Number(course.amount) || 0),
  }));

  // Group enrollments by date for chart
  const enrollmentsByDate = enrollments.reduce((acc, enrollment) => {
    const date = new Date(enrollment.createdAt).toLocaleDateString();
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.entries(enrollmentsByDate)
    .map(([date, count]) => ({ date, count }))
    .slice(-7); // Last 7 days

  return (
    <AnalyticsClient
      stats={{
        totalCourses: courses.length,
        totalEnrollments,
        totalRevenue,
        publishedCourses: courses.filter((c) => c.isPublished).length,
      }}
      courseStats={courseStats}
      chartData={chartData}
      recentEnrollments={enrollments
        .filter((e) => e.course !== null)
        .map((e) => ({
          id: e.id,
          createdAt: e.createdAt,
          course: e.course!,
        }))
        .slice(0, 10)}
      adminTitle={admin.title}
    />
  );
}
