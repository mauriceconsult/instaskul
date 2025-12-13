import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import {
  LayoutDashboard,
  ListChecks,
  File,
  ArrowLeft,
  Image,
  // Eye,
  DollarSign,
} from "lucide-react";
import { IconBadge } from "@/components/icon-badge";
import { Banner } from "@/components/banner";
import { CourseActions } from "./_components/course-actions";
import { CourseTitleForm } from "./_components/course-title-form";
import { CourseDescriptionForm } from "./_components/course-description-form";
import { CourseImageForm } from "./_components/course-image-form";
import { CourseAttachmentForm } from "./_components/course-attachment-form";
import { CourseTutorForm } from "./_components/course-tutor-form";
import { CourseCourseworkForm } from "./_components/course-coursework-form";
import Link from "next/link";
import { DashboardLayout } from "@/components/dashboard-layout";
import { CourseAdminForm } from "./_components/course-admin-form";
import { CourseAmountForm } from "./_components/course-amount-form";

export const dynamic = "force-dynamic";

const CourseIdPage = async ({
  params,
}: {
  params: Promise<{
    adminId: string;
    courseId: string;
  }>;
}) => {
  const { userId } = await auth();
  if (!userId) {
    console.error(
      `[${new Date().toISOString()} CourseIdPage] No userId from auth`
    );
    return redirect("/");
  }

  const resolvedParams = await params;
  console.log("Resolved params:", resolvedParams);

  if (!resolvedParams.adminId || !resolvedParams.courseId) {
    console.error(
      `[${new Date().toISOString()} CourseIdPage] Invalid params`,
      resolvedParams
    );
    return <div>Invalid admin or course ID</div>;
  }

  const course = await prisma.course.findUnique({
    where: {
      id: resolvedParams.courseId,
      userId,
      adminId: resolvedParams.adminId,
    },
    include: {
      tutors: true,
      attachments: true,
      courseworks: {
        orderBy: { position: "asc" },
      },
    },
  });

  const admin = await prisma.admin.findUnique({
    where: {
      id: resolvedParams.adminId,
      userId,
    },
  });

  const admins = await prisma.admin.findMany({
    where: { userId },
    select: {
      id: true,
      title: true,
    },
    orderBy: {
      title: "asc",
    },
  });

  console.log("Course query result:", JSON.stringify(course, null, 2));
  console.log("Admin query result:", JSON.stringify(admin, null, 2));
  console.log("Admins for options:", JSON.stringify(admins, null, 2));

  if (!course || !admin) {
    console.error(
      `[${new Date().toISOString()} CourseIdPage] Course or admin not found:`,
      {
        adminId: resolvedParams.adminId,
        courseId: resolvedParams.courseId,
        userId,
      }
    );
    return (
      <div className="p-6">
        <h2 className="text-2xl font-medium">Course or Admin Not Found</h2>
        <p>
          The requested course or admin does not exist or you do not have access
          to it.
        </p>
        <p>Admin ID: {resolvedParams.adminId}</p>
        <p>Course ID: {resolvedParams.courseId}</p>
        <p>User ID: {userId}</p>
      </div>
    );
  }

  const initialData = {
    ...course,
    description: course.description ?? "",
    imageUrl: course.imageUrl ?? null,
    attachments: course.attachments ?? [],
    tutors: course.tutors ?? [],
    courseworks: course.courseworks ?? [],
  };

  const requiredFields = [
    initialData.title,
    initialData.description,
    initialData.imageUrl,
    initialData.adminId,
    initialData.tutors.some((tutor) => tutor.isPublished),
    initialData.courseworks.length > 0,
  ];
  const optionalFields = [initialData.attachments.length > 0];
  const totalFields = [...requiredFields, ...optionalFields].length;
  const completedFields = [...requiredFields, ...optionalFields].filter(
    Boolean
  ).length;
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
          label="This Course is unpublished. To publish, complete the required* fields. Ensure you have at least one published Tutorial and one Coursework."
        />
      )}
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div className="w-full">
            <Link
              className="flex items-center text-sm hover:opacity-75 transition mb-6"
              href={`/admin/create-admin/${resolvedParams.adminId}`}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Admin creation
            </Link>
            <div className="flex items-center justify-between w-full">
              <div className="flex flex-col gap-y-2">
                <h1 className="text-2xl font-medium">Course creation</h1>
                <div className="text-sm text-slate-700">
                  <div>Completed fields {completionText}</div>
                </div>
              </div>
              <CourseActions
                disabled={!isComplete}
                adminId={resolvedParams.adminId}
                courseId={resolvedParams.courseId}
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
                <h2 className="text-xl">Enter course details</h2>
              </div>
              <CourseTitleForm
                initialData={initialData}
                adminId={resolvedParams.adminId}
                courseId={resolvedParams.courseId}
              />
              <CourseAdminForm
                initialData={initialData}
                adminId={resolvedParams.adminId}
                courseId={resolvedParams.courseId}
                options={admins.map((admin) => ({
                  label: admin.title,
                  value: admin.id,
                }))}
              />
              <CourseDescriptionForm
                initialData={initialData}
                adminId={resolvedParams.adminId}
                courseId={resolvedParams.courseId}
              />
            </div>
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-x-2">
                  <IconBadge icon={Image} />
                  <h2 className="text-xl">Add a course cover image</h2>
                </div>
                <CourseImageForm
                  initialData={initialData}
                  adminId={resolvedParams.adminId}
                  courseId={resolvedParams.courseId}
                />
              </div>
              <div>
                <div className="flex items-center gap-x-2">
                  <IconBadge icon={File} />
                  <h2 className="text-xl">Resources & attachments</h2>
                </div>
                <CourseAttachmentForm
                  initialData={initialData}
                  adminId={resolvedParams.adminId}
                  courseId={resolvedParams.courseId}
                />
              </div>
              <div>
                <div className="flex items-center gap-x-2">
                  <IconBadge icon={DollarSign} />
                  <h2 className="text-xl">Sell your Course</h2>
                </div>
                <CourseAmountForm
                  initialData={initialData}
                  adminId={resolvedParams.adminId}
                  courseId={resolvedParams.courseId}
                />
              </div>
              <div>
                <div className="flex items-center gap-x-2">
                  <IconBadge icon={ListChecks} />
                  <h2 className="text-xl">Course tutorials</h2>
                </div>
                <CourseTutorForm
                  initialData={initialData}
                  adminId={resolvedParams.adminId}
                  courseId={resolvedParams.courseId}
                />
              </div>
              <div>
                <div className="flex items-center gap-x-2">
                  <IconBadge icon={ListChecks} />
                  <h2 className="text-xl">Course courseworks</h2>
                </div>
                <CourseCourseworkForm
                  initialData={initialData}
                  adminId={resolvedParams.adminId}
                  courseId={resolvedParams.courseId}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CourseIdPage;
