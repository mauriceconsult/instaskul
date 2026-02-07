// app/courses/[courseId]/coursenoticeboards/page.tsx
import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Bell, Calendar, Lock } from "lucide-react";

interface CourseNoticeboardsPageProps {
  params: Promise<{ courseId: string }>;
}

export default async function CourseNoticeboardsPage({ 
  params 
}: CourseNoticeboardsPageProps) {
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
      adminId: true,
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

  // Fetch course-specific noticeboards
  const noticeboards = await prisma.noticeboard.findMany({
    where: {
      adminId: course.adminId,
      isPublished: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link
            href={`/courses/${courseId}`}
            className="inline-flex items-center text-sm text-slate-600 hover:text-slate-900 mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to course
          </Link>

          <div className="flex items-center gap-3">
            <Bell className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Announcements</h1>
              <p className="text-slate-600">{course.title}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Noticeboards List */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {!canAccess && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-8">
            <p className="text-yellow-800 mb-4">
              🔒 <strong>Enrollment Required:</strong> Enroll to receive course announcements and updates.
            </p>
            <Link
              href={`/courses/${courseId}/checkout`}
              className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Enroll Now
            </Link>
          </div>
        )}

        {noticeboards.length === 0 ? (
          <div className="bg-white rounded-xl border p-12 text-center">
            <Bell className="h-16 w-16 mx-auto text-slate-400 mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">
              No announcements yet
            </h3>
            <p className="text-slate-600">
              The instructor hasn't posted any announcements for this course
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {noticeboards.map((notice) => {
              const isLocked = !canAccess;

              return (
                <Link
                  key={notice.id}
                  href={
                    isLocked 
                      ? "#" 
                      : `/courses/${courseId}/coursenoticeboards/${notice.id}`
                  }
                  className={`block bg-white rounded-xl border p-6 hover:shadow-lg transition-all duration-200 group ${
                    isLocked ? "opacity-60 cursor-not-allowed" : ""
                  }`}
                >
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <h2 className="text-2xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors flex-1">
                      {notice.title}
                    </h2>
                    {isLocked ? (
                      <Lock className="h-5 w-5 text-slate-400 flex-shrink-0" />
                    ) : (
                      <span className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium flex-shrink-0">
                        <Bell className="h-3 w-3" />
                        New
                      </span>
                    )}
                  </div>

                  {notice.description && !isLocked && (
                    <p className="text-slate-600 mb-4 line-clamp-3">
                      {notice.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {new Date(notice.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </span>
                    </div>

                    {!isLocked && (
                      <span className="text-sm font-semibold text-blue-600 group-hover:translate-x-1 transition-transform">
                        Read more →
                      </span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
