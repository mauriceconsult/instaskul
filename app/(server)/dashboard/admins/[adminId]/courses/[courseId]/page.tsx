import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { IconBadge } from "@/components/icon-badge";
import { ArrowLeft, DollarSign, File, LayoutDashboard, ListChecks } from "lucide-react";
import Link from "next/link";
import { Banner } from "@/components/banner";
import { CourseTitleForm } from "./_components/course-title-form";
import { CourseDescriptionForm } from "./_components/course-description-form";
import { CourseImageForm } from "./_components/course-image-form";
import { CourseAdminForm } from "./_components/course-admin-form";
import { CourseActions } from "./_components/course-actions";
import { CourseAmountForm } from "./_components/course-amount-form";
import { CourseTutorialsForm } from "./_components/course-tutorials-form";
import type { Admin } from "@prisma/client";
import { CourseCourseworksForm } from "./_components/course-courseworks-form";
import { CourseCourseNoticeboardsForm } from "./_components/course-course-noticeboards-form";
import { CourseAttachmentsForm } from "./_components/course-attachments-form";

const CourseIdPage = async ({
  params,
}: {
  params: Promise<{ adminId: string; courseId: string }>;
}) => {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { adminId, courseId } = await params;

  const course = await prisma.course.findUnique({
    where: { id: courseId, adminId },
    include: {
      attachments: { orderBy: { createdAt: "desc" } },
      tutors: { orderBy: { position: "asc" } },
      courseworks: { orderBy: { position: "asc" } },
      courseNoticeboards: { orderBy: { position: "asc" } },
    },
  });

  if (!course) redirect("/dashboard");

  const admins = await prisma.admin.findMany({
    orderBy: { title: "asc" },
  });

  const requiredFields = [
    course.title,
    course.description,
    course.imageUrl,
    course.adminId,
  ];

  const totalFields = requiredFields.length;
  const completedFields = requiredFields.filter(Boolean).length;
  const completionText = `(${completedFields}/${totalFields})`;
  const isComplete = requiredFields.every(Boolean);

  return (
    <>
      {!course.isPublished && (
        <Banner
          variant="warning"
          label="This course is unpublished. Complete the required* fields to publish."
        />
      )}
      <div className="p-6">
        <Link
          href={`/dashboard/admins/${adminId}`}
          className="flex items-center text-sm hover:opacity-75 transition mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to admin setup
        </Link>

        <div className="flex items-center justify-between mb-8">
          <div className="flex flex-col gap-y-2">
            <h1 className="text-3xl font-bold">Course setup</h1>
            <span className="text-sm text-slate-600">
              Complete all fields {completionText}
            </span>
          </div>
          <CourseActions
            disabled={!isComplete}
            adminId={adminId}
            courseId={courseId}
            isPublished={course.isPublished}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column: Customization */}
          <div className="space-y-8">
            <div className="flex items-center gap-x-2">
              <IconBadge icon={LayoutDashboard} />
              <h2 className="text-2xl">Customize</h2>
            </div>
            <CourseTitleForm initialData={{ title: course.title }} adminId={adminId} courseId={courseId} />
            <CourseAdminForm
              initialData={course}
              adminId={adminId}
              courseId={courseId}
              options={admins.map((admin: Admin) => ({
                label: admin.title,
                value: admin.id,
              }))}
            />
            <CourseDescriptionForm initialData={course} adminId={adminId} courseId={courseId} />
            <CourseImageForm initialData={course} adminId={adminId} courseId={courseId} />
          </div>

          {/* Right Column: Sell & Content */}
          <div className="space-y-8">
            <div>
              <div className="flex items-center gap-x-2">
                <IconBadge icon={DollarSign} />
                <h2 className="text-2xl">Sell your course</h2>
              </div>
              <CourseAmountForm initialData={course} courseId={courseId} adminId={adminId} />
            </div>

            <div>
              <div className="flex items-center gap-x-2">
                <IconBadge icon={ListChecks} />
                <h2 className="text-2xl">Tutorials</h2>
              </div>
              <CourseTutorialsForm initialData={{ tutors: course.tutors || [] }} adminId={adminId} courseId={courseId} />              
            </div>

            <div>
              <div className="flex items-center gap-x-2">
                <IconBadge icon={ListChecks} />
                <h2 className="text-2xl">Courseworks</h2>
              </div>
              <CourseCourseworksForm initialData={{ courseworks: course.courseworks || [] }}  adminId={adminId}  courseId={courseId} />
            </div>

            <div>
              <div className="flex items-center gap-x-2">
                <IconBadge icon={ListChecks} />
                <h2 className="text-2xl">Course notices</h2>
              </div>
              <CourseCourseNoticeboardsForm initialData={{ courseNoticeboards: course.courseNoticeboards || [] }}  adminId={adminId}  courseId={courseId} />
            </div>

            <div>
              <div className="flex items-center gap-x-2">
                <IconBadge icon={File} />
                <h2 className="text-2xl">Course resources & attachments</h2>
              </div>
              <CourseAttachmentsForm initialData={{ attachments: course.attachments || [] }}  adminId={adminId}  courseId={courseId} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CourseIdPage;