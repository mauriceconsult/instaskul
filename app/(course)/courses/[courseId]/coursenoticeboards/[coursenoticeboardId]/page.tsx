// app/courses/[courseId]/coursenoticeboards/[noticeboardId]/page.tsx
import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, User, Bell } from "lucide-react";
import { NoticeboardComments } from "@/components/noticeboard-comments";

interface CourseNoticeboardDetailPageProps {
  params: Promise<{ courseId: string; noticeboardId: string }>;
}

export default async function CourseNoticeboardDetailPage({
  params,
}: CourseNoticeboardDetailPageProps) {
  const { userId } = await auth();

  if (!userId) {
    return redirect("/sign-in");
  }

  const { courseId, noticeboardId } = await params;

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

  const comments = await fetch(
  `${process.env.NEXT_PUBLIC_APP_URL}/api/coursenoticeboards/${noticeboardId}/comments`
).then(res => res.json());

  // Check enrollment
  const tuition = await prisma.tuition.findUnique({
    where: {
      userId_courseId: { userId, courseId },
    },
  });

  const isEnrolled = tuition?.isPaid || false;
  const isCreator = course.admin?.userId === userId;
  const canAccess = isEnrolled || isCreator;

  if (!canAccess) {
    return redirect(`/courses/${courseId}/checkout`);
  }

  const noticeboard = await prisma.noticeboard.findUnique({
    where: {
      id: noticeboardId,
      adminId: course.adminId,
      isPublished: true,
    },
  });

  if (!noticeboard) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link
            href={`/courses/${courseId}/coursenoticeboards`}
            className="inline-flex items-center text-sm text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to announcements
          </Link>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <article className="bg-white rounded-xl shadow-sm border p-8 md:p-12">
          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 mb-6 pb-6 border-b">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span>{course.admin?.title}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>
                {new Date(noticeboard.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              <span>Course Announcement</span>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
            {noticeboard.title}
          </h1>

          {/* Description/Content */}
          <div className="prose prose-slate max-w-none">
            {noticeboard.description ? (
              <div
                className="text-slate-700 leading-relaxed whitespace-pre-wrap"
                dangerouslySetInnerHTML={{ __html: noticeboard.description }}
              />
            ) : (
              <p className="text-slate-700 leading-relaxed">
                No additional details provided.
              </p>
            )}
          </div>

          {/* Footer */}
          <div className="mt-12 pt-6 border-t space-y-3">
            <Link
              href={`/courses/${courseId}/coursenoticeboards`}
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              View all announcements
            </Link>
            <div>
              <Link
                href={`/courses/${courseId}`}
                className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 font-medium transition-colors text-sm"
              >
                Back to {course.title}
              </Link>
            </div>
          </div>
        </article>
        <div className="mt-12">
  <NoticeboardComments
    noticeboardId={noticeboardId}
    initialComments={comments}
    type="coursenoticeboard"
  />
</div>
      </main>
    </div>
  );
}
