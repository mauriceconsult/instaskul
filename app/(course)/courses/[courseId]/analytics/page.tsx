// app/courses/[courseId]/analytics/page.tsx
import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import CourseAnalyticsClient from "./_components/course-analytics-client";

interface CourseAnalyticsPageProps {
  params: Promise<{ courseId: string }>;
}

export default async function CourseAnalyticsPage({
  params,
}: CourseAnalyticsPageProps) {
  const { userId } = await auth();

  if (!userId) {
    return redirect("/sign-in");
  }

  const { courseId } = await params;

  const course = await prisma.course.findUnique({
    where: {
      id: courseId,
      isPublished: true,
    },
    select: {
      id: true,
      title: true,
      admin: {
        select: {
          userId: true,
          title: true,
        },
      },
    },
  });

  if (!course) {
    notFound();
  }

  // Check enrollment
  const tuition = await prisma.tuition.findUnique({
    where: {
      userId_courseId: { userId, courseId },
    },
  });

  const isEnrolled = tuition?.isPaid || false;
  const isCreator = course.admin.userId === userId;
  const canAccess = isEnrolled || isCreator;

  if (!canAccess) {
    return redirect(`/courses/${courseId}/checkout`);
  }

  // Fetch student progress data
  const [tutors, userProgress, assignments] = await Promise.all([
    // All tutorials in the course
    prisma.tutor.findMany({
      where: {
        courseId,
        isPublished: true,
      },
      orderBy: {
        position: "asc",
      },
      select: {
        id: true,
        title: true,
        position: true,
      },
    }),

    // User's progress on tutorials
    prisma.userProgress.findMany({
      where: {
        userId,
        tutor: {
          courseId,
        },
      },
      include: {
        tutor: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    }),

    // All assignments in the course
    prisma.assignment.findMany({
      where: {
        tutor: {
          courseId,
        },
        isPublished: true,
      },
      include: {
        tutor: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    }),
  ]);

  // Calculate statistics
  const totalTutorials = tutors.length;
  const completedTutorials = userProgress.filter((p) => p.isCompleted).length;
  const progressPercentage = totalTutorials > 0 
    ? Math.round((completedTutorials / totalTutorials) * 100) 
    : 0;

  // Get recent activity (last 7 days)
  const recentProgress = userProgress
    .filter((p) => {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return new Date(p.updatedAt) >= weekAgo;
    })
    .slice(0, 5);

  // Create progress timeline
  const progressByDate = userProgress.reduce((acc, progress) => {
    const date = new Date(progress.updatedAt).toLocaleDateString();
    if (!acc[date]) {
      acc[date] = 0;
    }
    if (progress.isCompleted) {
      acc[date]++;
    }
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.entries(progressByDate)
    .map(([date, count]) => ({ date, count }))
    .slice(-7);

  // Calculate time stats
  const enrollmentDate = tuition?.createdAt || new Date();
  const daysEnrolled = Math.floor(
    (Date.now() - enrollmentDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <CourseAnalyticsClient
      course={{
        id: course.id,
        title: course.title,
        instructorName: course.admin.title,
      }}
      stats={{
        totalTutorials,
        completedTutorials,
        progressPercentage,
        totalAssignments: assignments.length,
        daysEnrolled,
      }}
      recentProgress={recentProgress.map((p) => ({
        tutorTitle: p.tutor.title,
        isCompleted: p.isCompleted,
        updatedAt: p.updatedAt,
      }))}
      chartData={chartData}
      tutorialsProgress={tutors.map((tutor) => {
        const progress = userProgress.find((p) => p.tutorId === tutor.id);
        return {
          id: tutor.id,
          title: tutor.title,
          isCompleted: progress?.isCompleted || false,
          position: tutor.position || 0,
        };
      })}
    />
  );
}
