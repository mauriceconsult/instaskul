import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { LayoutDashboard, ArrowLeft } from "lucide-react";
import { IconBadge } from "@/components/icon-badge";
import { Banner } from "@/components/banner";
import Link from "next/link";
import { DashboardLayout } from "@/components/dashboard-layout";
import { CourseCourseNoticeboardActions } from "./_components/course-coursenoticeboard-actions";
import { CourseCourseNoticeboardTitleForm } from "./_components/course-coursenoticeboard-title-form";
import { CourseCourseNoticeboardCourseForm } from "./_components/course-coursenoticeboard-course-form";
import { CourseCourseNoticeboardDescriptionForm } from "./_components/course-coursenoticeboard-description-form";


export const dynamic = "force-dynamic";

const CourseCourseNoticeboardIdPage = async ({
  params,
}: {
  params: Promise<{
    adminId: string;
    courseId: string;
    courseCoursenoticeboardId: string;
  }>;
}) => {
  const { userId } = await auth();
  if (!userId) {
    console.error(
      `[${new Date().toISOString()} CourseCourseNoticeboardIdPage] No userId from auth`
    );
    return redirect("/sign-in");
  }

  const resolvedParams = await params;
  console.log("CourseCourseNoticeboardIdPage params:", resolvedParams);

  if (
    !resolvedParams.adminId ||
    !resolvedParams.courseId ||
    !resolvedParams.courseCoursenoticeboardId
  ) {
    console.error(
      `[${new Date().toISOString()} CourseCourseNoticeboardIdPage] Invalid params`,
      resolvedParams
    );
    return redirect(
      `/admin/create-admin/${resolvedParams.adminId}/course/${resolvedParams.courseId}`
    );
  }

  const courseCourseNoticeboard = await prisma.courseNoticeboard.findUnique({
    where: {
      id: resolvedParams.courseCoursenoticeboardId,
      courseId: resolvedParams.courseId,
      userId,
    },
    include: {
      course: true,
    },
  });

  if (!courseCourseNoticeboard) {
    console.error(
      `[${new Date().toISOString()} CourseCourseNoticeboardIdPage] CourseCourseNoticeboard not found:`,
      {
        courseCoursenoticeboardId: resolvedParams.courseCoursenoticeboardId,
        courseId: resolvedParams.courseId,
        userId,
      }
    );
    return redirect(
      `/admin/create-admin/${resolvedParams.adminId}/course/${resolvedParams.courseId}`
    );
  }

  if (!courseCourseNoticeboard.course) {
    console.error(
      `[${new Date().toISOString()} CourseCourseNoticeboardIdPage] Course not found for courseCourseNoticeboard:`,
      {
        courseCoursenoticeboardId: resolvedParams.courseCoursenoticeboardId,
        courseId: resolvedParams.courseId,
      }
    );
    return redirect(
      `/admin/create-admin/${resolvedParams.adminId}/course/${resolvedParams.courseId}`
    );
  }

  // Fetch all courses for the admin to populate Combobox options
  const courses = await prisma.course.findMany({
    where: {
      adminId: resolvedParams.adminId,
      userId,
    },
    select: {
      id: true,
      title: true,
    },
    orderBy: {
      title: "asc",
    },
  });

  const options = courses.map((course) => ({
    label: course.title,
    value: course.id,
  }));

  console.log("CourseCourseNoticeboardIdPage fetched data:", {
    courseCoursenoticeboardId: courseCourseNoticeboard.id,
    courseId: courseCourseNoticeboard.courseId,
    adminId: courseCourseNoticeboard.course.adminId,
    options: options.map((opt) => ({ label: opt.label, value: opt.value })),
  });

  const initialData = {
    ...courseCourseNoticeboard,
    description: courseCourseNoticeboard.description ?? "",
  };

  const requiredFields = [
    initialData.title,
    initialData.description,
    initialData.courseId,
  ];
  const totalFields = requiredFields.length;
  const completedFields = requiredFields.filter(Boolean).length;
  const completionText = `(${completedFields} of ${totalFields})`;
  const isComplete = requiredFields.every(Boolean);

  return (
    <DashboardLayout
      adminId={resolvedParams.adminId}
      courseId={resolvedParams.courseId}
    >
      {!initialData.isPublished && (
        <Banner
          variant="warning"
          label="This CourseCourseNoticeboard is unpublished. To publish, complete the required fields."
        />
      )}
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div className="w-full">
            <Link
              className="flex items-center text-sm hover:opacity-75 transition mb-6"
              href={`/admin/create-admin/${resolvedParams.adminId}/course/${resolvedParams.courseId}`}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Course creation
            </Link>
            <div className="flex items-center justify-between w-full">
              <div className="flex flex-col gap-y-2">
                <h1 className="text-2xl font-medium">CourseCourseNoticeboard creation</h1>
                <div className="text-sm text-slate-700">
                  <div>Completed fields {completionText}</div>
                </div>
              </div>
              <CourseCourseNoticeboardActions
                disabled={!isComplete}
                adminId={resolvedParams.adminId}
                courseId={resolvedParams.courseId}
                courseCoursenoticeboardId={courseCourseNoticeboard.id}
                isPublished={initialData.isPublished}
              />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-16">
          <div className="space-y-4">
            <div>
              <div className="flex items-center gap-x-2">
                <IconBadge icon={LayoutDashboard} />
                <h2 className="text-xl">Enter courseCourseNoticeboard details</h2>
              </div>
              <CourseCourseNoticeboardTitleForm
                initialData={initialData}
                adminId={resolvedParams.adminId}
                courseId={resolvedParams.courseId}
                courseCoursenoticeboardId={courseCourseNoticeboard.id}
              />
              <CourseCourseNoticeboardCourseForm
                initialData={initialData}
                adminId={resolvedParams.adminId}
                courseId={resolvedParams.courseId}
                courseCoursenoticeboardId={courseCourseNoticeboard.id}
                options={options}
              />
              <CourseCourseNoticeboardDescriptionForm
                initialData={initialData}
                adminId={resolvedParams.adminId}
                courseId={resolvedParams.courseId}
                courseCoursenoticeboardId={courseCourseNoticeboard.id}
              />
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CourseCourseNoticeboardIdPage;
