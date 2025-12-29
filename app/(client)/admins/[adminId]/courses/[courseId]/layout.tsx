import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { CourseNavbar } from "./_components/course-navbar";
import { getCourseProgress } from "@/actions/get-course-progress";
import { getCourseworkProgress } from "@/actions/get-coursework-progress";
import { CourseSidebar } from "./_components/course-sidebar";

export default async function CourseLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ adminId: string; courseId: string }>;
}) {
  const { userId } = await auth();
  
  if (!userId) {
    return redirect("/sign-in");
  }

  const { adminId, courseId } = await params;

  // Parallel queries for better performance
  const [course, courseProgressCount, courseworkProgressCount] = await Promise.all([
    prisma.course.findUnique({
      where: {
        id: courseId,
        adminId,
      },
      include: {
        courseNoticeboards: {
          where: { isPublished: true },
          orderBy: { position: "asc" },
        },
        courseworks: {
          where: { isPublished: true },
          include: {
            userProgress: {
              where: { userId },
              select: {
                isCompleted: true,
              },
            },
          },
          orderBy: { position: "asc" },
        },
        tutors: {
          where: { isPublished: true },
          include: {
            userProgress: {
              where: { userId },
              select: {
                isCompleted: true,
              },
            },
          },
          orderBy: { position: "asc" },
        },
      },
    }),
    getCourseProgress(userId, courseId),
    getCourseworkProgress(userId, courseId),
  ]);

  if (!course) {
    return redirect(`/admins/${adminId}`);
  }

  return (
    <div className="h-full">
      {/* Fixed Navbar */}
      <div className="h-[80px] md:pl-80 fixed inset-y-0 w-full z-50">
        <CourseNavbar 
          course={course} 
          courseProgressCount={courseProgressCount}
          courseworkProgressCount={courseworkProgressCount}
          adminId={adminId}
        />
      </div>

      {/* Fixed Sidebar */}
      <div className="hidden md:flex h-full w-80 flex-col fixed inset-y-0 z-50">
        <CourseSidebar 
          course={course} 
          courseProgressCount={courseProgressCount}
          courseworkProgressCount={courseworkProgressCount}
          adminId={adminId}
        />
      </div>

      {/* Main Content */}
      <main className="md:pl-80 pt-[80px] h-full">
        {children}
      </main>
    </div>
  );
}