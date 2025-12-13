import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { LayoutDashboard, ArrowLeft } from "lucide-react";
import { IconBadge } from "@/components/icon-badge";
import { Banner } from "@/components/banner";
import Link from "next/link";
import { DashboardLayout } from "@/components/dashboard-layout";
import { CourseworkTitleForm } from "./_components/coursework-title-form";
import { CourseworkDescriptionForm } from "./_components/coursework-description-form";
import { CourseworkActions } from "./_components/coursework-actions";
import { CourseworkCourseForm } from "./_components/coursework-course-form";

export const dynamic = "force-dynamic";

const CourseworkIdPage = async ({
  params,
}: {
  params: Promise<{
    adminId: string;
    courseId: string;
    courseworkId: string;
  }>;
}) => {
  const { userId } = await auth();
  if (!userId) {
    console.error(
      `[${new Date().toISOString()} CourseworkIdPage] No userId from auth`
    );
    return redirect("/sign-in");
  }

  const resolvedParams = await params;
  console.log("CourseworkIdPage params:", resolvedParams);

  if (
    !resolvedParams.adminId ||
    !resolvedParams.courseId ||
    !resolvedParams.courseworkId
  ) {
    console.error(
      `[${new Date().toISOString()} CourseworkIdPage] Invalid params`,
      resolvedParams
    );
    return redirect(
      `/admin/create-admin/${resolvedParams.adminId}/course/${resolvedParams.courseId}`
    );
  }

  const coursework = await prisma.coursework.findUnique({
    where: {
      id: resolvedParams.courseworkId,
      courseId: resolvedParams.courseId,
      userId,
    },
    include: {
      course: true,
    },
  });

  if (!coursework) {
    console.error(
      `[${new Date().toISOString()} CourseworkIdPage] Coursework not found:`,
      {
        courseworkId: resolvedParams.courseworkId,
        courseId: resolvedParams.courseId,
        userId,
      }
    );
    return redirect(
      `/admin/create-admin/${resolvedParams.adminId}/course/${resolvedParams.courseId}`
    );
  }

  if (!coursework.course) {
    console.error(
      `[${new Date().toISOString()} CourseworkIdPage] Course not found for coursework:`,
      {
        courseworkId: resolvedParams.courseworkId,
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

  console.log("CourseworkIdPage fetched data:", {
    courseworkId: coursework.id,
    courseId: coursework.courseId,
    adminId: coursework.course.adminId,
    options: options.map((opt) => ({ label: opt.label, value: opt.value })),
  });

  const initialData = {
    ...coursework,
    description: coursework.description ?? "",
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
          label="This Coursework is unpublished. To publish, complete the required fields."
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
                <h1 className="text-2xl font-medium">Coursework creation</h1>
                <div className="text-sm text-slate-700">
                  <div>Completed fields {completionText}</div>
                </div>
              </div>
              <CourseworkActions
                disabled={!isComplete}
                adminId={resolvedParams.adminId}
                courseId={resolvedParams.courseId}
                courseworkId={coursework.id}
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
                <h2 className="text-xl">Enter coursework details</h2>
              </div>
              <CourseworkTitleForm
                initialData={initialData}
                adminId={resolvedParams.adminId}
                courseId={resolvedParams.courseId}
                courseworkId={coursework.id}
              />
              <CourseworkCourseForm
                initialData={initialData}
                adminId={resolvedParams.adminId}
                courseId={resolvedParams.courseId}
                courseworkId={coursework.id}
                options={options}
              />
              <CourseworkDescriptionForm
                initialData={initialData}
                adminId={resolvedParams.adminId}
                courseId={resolvedParams.courseId}
                courseworkId={coursework.id}
              />
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CourseworkIdPage;
