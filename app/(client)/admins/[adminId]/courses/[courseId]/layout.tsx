import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { CourseNavbar } from "./_components/course-navbar";
import { CourseSidebar } from "./_components/course-sidebar";
import { getCourseProgress } from "@/actions/get-course-progress";

interface CourseLayoutProps {
  children: React.ReactNode;
  params: Promise<{ courseId: string }>;
}

const CourseLayout = async ({ children, params }: CourseLayoutProps) => {
  try {
    const { userId } = await auth();
    if (!userId) {
      console.log("[CourseLayout] No userId, redirecting to /");
      return redirect("/");
    }

    const { courseId } = await params;
    console.log("[CourseLayout] Fetching course:", courseId);

    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        tutors: {
          where: { isPublished: true },
          include: { userProgress: { where: { userId } } },
          orderBy: { position: "asc" },
        },
      },
    });

    if (!course) {
      console.log(`[CourseLayout] Course not found: ${courseId}`);
      return redirect("/");
    }

    const progressCount = await getCourseProgress(userId, course.id);
    console.log(
      "[CourseLayout] Course:",
      course.id,
      "Progress:",
      progressCount
    );

    console.log("[CourseLayout] Fetching tuition for course:", course.id);
    const tuition = await prisma.tuition.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId: course.id,
        },
      },
    });

    const isEnrolled = !!tuition;

    return (
      <div className="h-full">
        <div className="h-[80px] md:pl-80 fixed inset-y-0 z-50">
          <CourseNavbar
            course={course}
            progressCount={progressCount}
            isEnrolled={isEnrolled}
          />
        </div>
        <div className="hidden md:flex h-full w-80 flex-col fixed inset-y-0 z-50">
          <CourseSidebar
            course={course}
            progressCount={progressCount}
            isEnrolled={isEnrolled}
          />
        </div>
        <main className="md:pl-80 pt-[80px] h-full">{children}</main>
      </div>
    );
  } catch (error) {
    console.error("[CourseLayout] Error:", error);
    return (
      <div className="p-4 text-red-500">
        Error loading course layout. Please try again later.
      </div>
    );
  }
};

export default CourseLayout;
