import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { IconBadge } from "@/components/icon-badge";
import { File, LayoutDashboard, ListChecks } from "lucide-react";
import { Banner } from "@/components/banner";
import { AdminTitleForm } from "./_components/admin-title-form";
import { AdminDescriptionForm } from "./_components/admin-description-form";
import { AdminImageForm } from "./_components/admin-image-form";
import { AdminSchoolForm } from "./_components/admin-school-form";
import { AdminActions } from "./_components/admin-actions";
import type { Course, School } from '@prisma/client';
import { AdminNoticeboardsForm } from "./_components/admin-noticeboards-form";
import { AdminCoursesForm } from "./_components/admin-courses-form";
import { AdminAttachmentsForm } from "./_components/admin-attachments-form";

const AdminIdPage = async ({
  params,
}: {
  params: Promise<{ adminId: string }>;
}) => {
  const { userId } = await auth();
  if (!userId) redirect("/");

  const { adminId } = await params;

  const admin = await prisma.admin.findUnique({
    where: { id: adminId, userId },
    include: {
      attachments: { orderBy: { createdAt: "desc" } },
      courses: { orderBy: { position: "asc" } },
      noticeboards: { orderBy: { position: "asc" } },
    },
  });

  
  const schools = await prisma.school.findMany({
    orderBy: { name: "asc" },
  });
  
  if (!admin) redirect("/sign-in");

  const requiredFields = [
    admin.title,
    admin.description,
    admin.imageUrl,
    admin.schoolId,
    admin.courses.some((course: Course) => course.isPublished),
  ];

  const totalFields = requiredFields.length;
  const completedFields = requiredFields.filter(Boolean).length;
  const completionText = `(${completedFields}/${totalFields})`;
  const isComplete = requiredFields.every(Boolean);

  return (
    <>
      {!admin.isPublished && (
        <Banner label="This admin is unpublished. Complete the required* fields to publish." />
      )}
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-y-2">
            <h1 className="text-3xl font-bold">Admin setup</h1>
            <span className="text-sm text-slate-600">
              Complete all fields {completionText}
            </span>
          </div>
          <AdminActions
            disabled={!isComplete}
            adminId={adminId}
            isPublished={admin.isPublished}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
          {/* Left Column: Customization */}
          <div className="space-y-8">
            <div className="flex items-center gap-x-2">
              <IconBadge icon={LayoutDashboard} />
              <h2 className="text-2xl">Customize</h2>
            </div>
            <AdminTitleForm initialData={admin} adminId={adminId} />
            <AdminDescriptionForm initialData={admin} adminId={adminId} />
            <AdminImageForm initialData={admin} adminId={adminId} />
            <AdminSchoolForm
              initialData={admin}
              adminId={adminId}
              options={schools.map((school: School) => ({
                label: school.name,
                value: school.id,
              }))}
            />
          </div>

          {/* Right Column: Courses & Noticeboards */}
          <div className="space-y-8">
            <div>
              <div className="flex items-center gap-x-2">
                <IconBadge icon={ListChecks} />
                <h2 className="text-2xl">Courses</h2>
              </div>
              <AdminCoursesForm initialData={{ courses: admin.courses || [] }} adminId={adminId} />
            </div>

             <div>
              <div className="flex items-center gap-x-2">
                <IconBadge icon={File} />
                <h2 className="text-2xl">Admin Resources & Attachments</h2>
              </div>
              <AdminAttachmentsForm initialData={{ attachments: admin.attachments || [] }} adminId={adminId} />
            </div>

            <div>
              <div className="flex items-center gap-x-2">
                <IconBadge icon={ListChecks} />
                <h2 className="text-2xl">Noticeboards</h2>
              </div>
              <AdminNoticeboardsForm initialData={{ noticeboards: admin.noticeboards || [] }} adminId={adminId} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminIdPage;