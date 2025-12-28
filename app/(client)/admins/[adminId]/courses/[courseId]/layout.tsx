import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { CourseNavbar } from "./_components/course-navbar";
import { getCourseProgress } from "@/actions/get-course-progress";
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

  const course = await prisma.course.findUnique({
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
        orderBy: { position: "asc" },
      },
      tutors: {
        where: { isPublished: true },
        include: {
          userProgress: {
            where: { userId },
          },
        },
        orderBy: { position: "asc" },
      },
    },
  });

  if (!course) {
    return redirect(`/admins/${adminId}`);
  }

  const courseProgressCount = await getCourseProgress(userId, course.id);

  return (
    <div className="h-full">
      <div className="h-[80px] md:pl-80 fixed inset-y-0 w-full z-50">
        <CourseNavbar course={course} />
      </div>
      <div className="hidden md:flex h-full w-80 flex-col fixed inset-y-0 z-50">
        <CourseSidebar 
          course={course} 
          progressCount={courseProgressCount}
          adminId={adminId}
        />
      </div>
      <main className="md:pl-80 pt-[80px] h-full">{children}</main>
    </div>
  );
}