// app/courses/[courseId]/page.tsx
import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { CourseNavigation } from "@/components/course-navigation";
import { CourseOverview } from "@/components/course-overview";

const CourseIdPage = async ({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) => {
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
    include: {
      admin: {
        select: {
          title: true,
          userId: true,
        },
      },
      tutors: {
        where: { isPublished: true },
        orderBy: { position: "asc" },
        include: {
          assignments: {
            where: { isPublished: true },
          },
          userProgress: {
            where: { userId },
          },
        },
      },
      courseworks: {
        where: { isPublished: true },
        orderBy: { position: "asc" },
      },
    },
  });

  if (!course) {
    return redirect("/dashboard/search");
  }

  // Check if user is enrolled
  const tuition = await prisma.tuition.findUnique({
    where: {
      userId_courseId: { userId, courseId },
    },
  });

  const isEnrolled = tuition?.isPaid || false;
  const isCreator = course.admin?.userId === userId;

  // Calculate course progress
  const totalTutorials = course.tutors.length;
  const completedTutorials = course.tutors.filter(
    (tutor) => tutor.userProgress.length > 0 && tutor.userProgress[0].isCompleted
  ).length;
  const progressPercentage = totalTutorials > 0 
    ? Math.round((completedTutorials / totalTutorials) * 100) 
    : 0;

  // Transform course to match CourseNavigation expected types
  const transformedCourse = {
    id: course.id,
    title: course.title,
    description: course.description,
    imageUrl: course.imageUrl,
    amount: course.amount,
    admin: course.admin || { title: "Unknown" },
    tutors: course.tutors,
    courseworks: course.courseworks.map(cw => ({
      ...cw,
      position: cw.position ?? 0,
    })),
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Course Navigation */}
      <CourseNavigation 
        course={transformedCourse}
        isEnrolled={isEnrolled}
        isCreator={isCreator}
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <CourseOverview
          course={transformedCourse}
          isEnrolled={isEnrolled}
          isCreator={isCreator}
          progressPercentage={progressPercentage}
          totalTutorials={totalTutorials}
          completedTutorials={completedTutorials}
        />
      </main>
    </div>
  );
};

export default CourseIdPage;
