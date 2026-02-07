// app/admins/[adminId]/courses/page.tsx
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import CoursesClient from "./_components/courses-client";

export default async function CoursesPage({
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

  // Fetch courses with stats
  const courses = await prisma.course.findMany({
    where: {
      adminId,
    },
    include: {
      tutors: {
        where: { isPublished: true },
        select: { id: true },
      },
      _count: {
        select: {
          tutors: true,
          tuitions: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Get enrollment stats
  const enrollmentStats = await prisma.tuition.groupBy({
    by: ["courseId"],
    where: {
      course: {
        adminId,
      },
      isPaid: true,
    },
    _count: {
      userId: true,
    },
  });

  const enrollmentMap = Object.fromEntries(
    enrollmentStats.map((stat) => [stat.courseId, stat._count.userId])
  );

  const coursesWithStats = courses.map((course) => ({
    ...course,
    enrollments: enrollmentMap[course.id] || 0,
  }));

  return (
    <CoursesClient
      courses={coursesWithStats}
      adminId={adminId}
      adminTitle={admin.title}
    />
  );
}
