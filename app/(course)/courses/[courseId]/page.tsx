// app/courses/[courseId]/page.tsx
import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";

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
        select: {
          id: true,
          isFree: true,
        },
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

  // ✅ AUTO-NAVIGATE: Redirect to first tutorial if available
  if (course.tutors.length > 0) {
    const firstTutorial = course.tutors[0];
    
    // Always redirect to first tutorial
    // The tutorial page will handle showing lock/enroll button if needed
    return redirect(`/courses/${courseId}/tutors/${firstTutorial.id}`);
  }

  // If no tutorials, show fallback page
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center max-w-md mx-auto p-8 bg-white rounded-xl shadow-sm border">
        <div className="mb-6">
          <div className="h-16 w-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="h-8 w-8 text-slate-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            {course.title}
          </h1>
          <p className="text-slate-600">
            By {course.admin?.title || "Instructor"}
          </p>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-yellow-800">
            ⚠️ No tutorials available yet. The course creator is still preparing content.
          </p>
        </div>

        <Link
          href="/dashboard/search"
          className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
        >
          Browse Other Courses
        </Link>
      </div>
    </div>
  );
};

export default CourseIdPage;
