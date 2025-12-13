import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { LayoutDashboard, ListChecks, File } from "lucide-react";
import { IconBadge } from "@/components/icon-badge";
import { AdminTitleForm } from "./_components/admin-title-form";
import { AdminImageForm } from "./_components/admin-image-form";
import { AdminSchoolForm } from "./_components/admin-school-form";
import { AdminCourseForm } from "./_components/admin-course-form";
import { AdminAttachmentForm } from "./_components/admin-attachment-form";
import { Banner } from "@/components/banner";
import { AdminActions } from "./_components/admin-actions";
import { AdminNoticeboardForm } from "./_components/admin-noticeboard-form";
import { DashboardLayout } from "@/components/dashboard-layout";
import { AdminDescriptionForm } from "./_components/admin-description-form";

const AdminIdPage = async ({
  params,
}: {
  params: Promise<{
    adminId: string;
  }>;
}) => {
  const { userId } = await auth();
  if (!userId) {
    console.error(
      `[${new Date().toISOString()} AdminIdPage] No userId from auth`
    );
    return redirect("/");
  }

  const resolvedParams = await params;
  console.log("Resolved params:", resolvedParams);

  if (!resolvedParams.adminId) {
    console.error(
      `[${new Date().toISOString()} AdminIdPage] No adminId provided in params`
    );
    return (
      <div className="p-6">
        <h2 className="text-2xl font-medium">Invalid Admin ID</h2>
        <p>No admin ID was provided in the URL.</p>
      </div>
    );
  }

  const admin = await prisma.admin.findUnique({
    where: {
      id: resolvedParams.adminId,
      userId,
    },
    include: {
      attachments: true,
      courses: true,
      noticeboards: true,
    },
  });

  console.log("Admin query result:", JSON.stringify(admin, null, 2));

  const school = await prisma.school.findMany({
    select: {
      id: true,
      name: true,
    },
    orderBy: {
      name: "asc",
    },
  });
  console.log("School query result:", school);

  if (!admin) {
    console.error(
      `[${new Date().toISOString()} AdminIdPage] Admin not found:`,
      { adminId: resolvedParams.adminId, userId }
    );
    return (
      <div className="p-6">
        <h2 className="text-2xl font-medium">Admin Not Found</h2>
        <p>
          The requested admin does not exist or you do not have access to it.
        </p>
        <p>Admin ID: {resolvedParams.adminId}</p>
        <p>User ID: {userId}</p>
      </div>
    );
  }

  if (school.length === 0) {
    console.error(
      `[${new Date().toISOString()} AdminIdPage] No schools found in the database`
    );
    return (
      <div className="p-6">
        <h2 className="text-2xl font-medium">No Schools Available</h2>
        <p>
          No schools are available in the database. Please create a school
          first.
        </p>
      </div>
    );
  }

  const initialData = {
    ...admin,
    description: admin.description ?? "",
    courses: admin.courses ?? [],
    noticeboards: admin.noticeboards ?? [],
    attachments: admin.attachments ?? [],
  };

  const requiredFields = [
    initialData.title,
    initialData.description,
    initialData.imageUrl,
    initialData.schoolId,
    initialData.courses.length > 0,
  ];
  const optionalFields = [
    initialData.noticeboards.length > 0,
    initialData.attachments.length > 0,
  ];
  const totalFields = [...requiredFields, ...optionalFields].length;
  const completedFields = [...requiredFields, ...optionalFields].filter(
    Boolean
  ).length;
  const completionText = `(${completedFields} of ${totalFields})`;
  const isComplete = requiredFields.every(Boolean);

  return (
    <DashboardLayout adminId={resolvedParams.adminId}>
      {!initialData.isPublished && (
        <Banner
          variant="warning"
          label="This Admin is not published yet. To publish, complete the required* fields and ensure you have at least one published Course."
        />
      )}
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div className="w-full">
            <div className="flex items-center justify-between w-full">
              <div className="flex flex-col gap-y-2">
                <h1 className="text-2xl font-medium">Admin creation</h1>
                <div className="text-sm text-slate-700">
                  <div>Completed fields {completionText}</div>
                </div>
              </div>
              <AdminActions
                disabled={!isComplete}
                adminId={resolvedParams.adminId}
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
                <h2 className="text-xl">Enter Admin details</h2>
              </div>
              <AdminTitleForm
                initialData={initialData}
                adminId={resolvedParams.adminId}
              />
              <AdminSchoolForm
                initialData={initialData}
                adminId={resolvedParams.adminId}
                options={school.map((cat) => ({
                  label: cat.name,
                  value: cat.id,
                }))}
              />
              <AdminDescriptionForm
                initialData={initialData}
                adminId={resolvedParams.adminId}
              />
              <AdminImageForm
                initialData={initialData}
                adminId={resolvedParams.adminId}
              />
            </div>
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-x-2">
                  <IconBadge icon={File} />
                  <h2 className="text-xl">Resources & Attachments</h2>
                </div>
                <AdminAttachmentForm
                  initialData={initialData}
                  adminId={resolvedParams.adminId}
                />
              </div>
              <div>
                <div className="flex items-center gap-x-2">
                  <IconBadge icon={ListChecks} />
                  <h2 className="text-xl">Courses</h2>
                </div>
                <AdminCourseForm
                  initialData={initialData}
                  adminId={resolvedParams.adminId}
                />
              </div>
              
              <div>
                <div className="flex items-center gap-x-2">
                  <IconBadge icon={ListChecks} />
                  <h2 className="text-xl">Admin notices</h2>
                </div>
                <AdminNoticeboardForm
                  initialData={initialData}
                  adminId={resolvedParams.adminId}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminIdPage;
