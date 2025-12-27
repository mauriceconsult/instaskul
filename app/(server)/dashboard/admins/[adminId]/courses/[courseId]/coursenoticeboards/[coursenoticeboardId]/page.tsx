import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { IconBadge } from "@/components/icon-badge";
import { ArrowLeft, File, LayoutDashboard } from "lucide-react";
import Link from "next/link";
import { Banner } from "@/components/banner";
import { CourseNoticeboardTitleForm } from "./_components/coursenoticeboard-title-form";
import { CourseNoticeboardActions } from "./_components/coursenoticeboard-actions";
import { CourseNoticeboardCourseForm } from "./_components/coursenoticeboard-course-form";
import { CourseNoticeboardDescriptionForm } from "./_components/coursenoticeboard-description-form";
import { CourseNoticeboardAttachmentsForm } from "./_components/coursenoticeboard-attachments-form";

const CourseNoticeboardIdPage = async ({
  params,
}: {
  params: Promise<{ adminId: string; courseId: string; coursenoticeboardId: string }>;
}) => {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { adminId, courseId, coursenoticeboardId } = await params;

  // Strict ownership check: courseNoticeboard must belong to this course & admin
  const courseNoticeboard = await prisma.courseNoticeboard.findUnique({
    where: {
      id: coursenoticeboardId,
      courseId,
      course: { adminId }, 
    },
    include: {
      attachments: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!courseNoticeboard) {
    console.error(`Course notice not found: ${coursenoticeboardId} for course ${courseId} under admin ${adminId}`);
    redirect("/dashboard"); 
  }

  const courses = await prisma.course.findMany({
    where: { adminId },
    orderBy: { title: "asc" },
  });

  const requiredFields = [
    courseNoticeboard.title,
    courseNoticeboard.description, 
    courseNoticeboard.courseId,
  ];

  const totalFields = requiredFields.length;
  const completedFields = requiredFields.filter(Boolean).length;
  const completionText = `(${completedFields}/${totalFields})`;
  const isComplete = requiredFields.every(Boolean);

  return (
    <>
      {!courseNoticeboard.isPublished && (
        <Banner
          variant="warning"
          label="This course notice is unpublished. Complete the required* fields to publish."
        />
      )}
      <div className="p-6">
        <Link
          href={`/dashboard/admins/${adminId}/courses/${courseId}`}
          className="flex items-center text-sm hover:opacity-75 transition mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to course setup
        </Link>

        <div className="flex items-center justify-between mb-8">
          <div className="flex flex-col gap-y-2">
            <h1 className="text-3xl font-bold">Course notice setup</h1>
            <span className="text-sm text-slate-600">
              Complete all fields {completionText}
            </span>
          </div>
          <CourseNoticeboardActions
            disabled={!isComplete}
            adminId={adminId}
            courseId={courseId}
            coursenoticeboardId={coursenoticeboardId}
            isPublished={courseNoticeboard.isPublished}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column: Customization */}
          <div className="space-y-8">
            <div className="flex items-center gap-x-2">
              <IconBadge icon={LayoutDashboard} />
              <h2 className="text-2xl">Customize</h2>
            </div>
            <CourseNoticeboardTitleForm initialData={{ title: courseNoticeboard.title }} adminId={adminId} courseId={courseId} coursenoticeboardId={coursenoticeboardId} />
            <CourseNoticeboardCourseForm
              initialData={courseNoticeboard}
              adminId={adminId}
              courseId={courseId}
              coursenoticeboardId={coursenoticeboardId}
              options={courses.map((course) => ({
                label: course.title,
                value: course.id,
              }))}
            />
            <CourseNoticeboardDescriptionForm initialData={courseNoticeboard} adminId={adminId} courseId={courseId} coursenoticeboardId={coursenoticeboardId} />
            
          <div className="space-y-8">
            <div>
              <div className="flex items-center gap-x-2">
                  <IconBadge icon={File } />
                <h2 className="text-2xl">Course notice Resources & Attachments</h2>
              </div>
              <CourseNoticeboardAttachmentsForm
                initialData={{ attachments: courseNoticeboard.attachments || [] }}
                adminId={adminId}
                courseId={courseId}
                coursenoticeboardId={coursenoticeboardId}
              />
            </div>
          </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CourseNoticeboardIdPage;