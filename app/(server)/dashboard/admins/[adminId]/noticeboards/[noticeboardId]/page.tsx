// app/admin/admins/[adminId]/noticeboards/[noticeboardId]/page.tsx
import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { IconBadge } from "@/components/icon-badge";
import { ArrowLeft, File, LayoutDashboard } from "lucide-react";
import Link from "next/link";
import { Banner } from "@/components/banner";
import type { Admin } from "@prisma/client";
import { NoticeboardActions } from "./_components/noticeboard-actions";
import { NoticeboardTitleForm } from "./_components/noticeboard-title-form";
import { NoticeboardAdminForm } from "./_components/noticeboard-admin-form";
import { NoticeboardDescriptionForm } from "./_components/noticeboard-description-form";
import { NoticeboardAttachmentsForm } from "./_components/noticeboard-attachments-form";

const NoticeboardIdPage = async ({
  params,
}: {
  params: Promise<{ adminId: string; noticeboardId: string }>;
}) => {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { adminId, noticeboardId } = await params;

  const noticeboard = await prisma.noticeboard.findUnique({
    where: { id: noticeboardId, adminId },
    include: {
      attachments: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!noticeboard) redirect("/dashboard");

  const admins = await prisma.admin.findMany({
    orderBy: { title: "asc" },
  });

  const requiredFields = [
    noticeboard.title,
    noticeboard.description,
    noticeboard.adminId,
  ];

  const totalFields = requiredFields.length;
  const completedFields = requiredFields.filter(Boolean).length;
  const completionText = `(${completedFields}/${totalFields})`;
  const isComplete = requiredFields.every(Boolean);

  return (
    <>
      {!noticeboard.isPublished && (
        <Banner
          variant="warning"
          label="This noticeboard is unpublished. Complete the required fields to publish."
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
            <h1 className="text-3xl font-bold">Noticeboard Setup</h1>
            <span className="text-sm text-slate-600">
              Complete all fields {completionText}
            </span>
          </div>
          <NoticeboardActions
            disabled={!isComplete}
            adminId={adminId}
            noticeboardId={noticeboardId}
            isPublished={noticeboard.isPublished}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column: Customization */}
          <div className="space-y-8">
            <div className="flex items-center gap-x-2">
              <IconBadge icon={LayoutDashboard} />
              <h2 className="text-2xl">Customize</h2>
            </div>
            <NoticeboardTitleForm
              initialData={{ title: noticeboard.title }}
              adminId={adminId}
              noticeboardId={noticeboardId}
            />
            <NoticeboardAdminForm
              initialData={noticeboard}
              adminId={adminId}
              noticeboardId={noticeboardId}
              options={admins.map((admin: Admin) => ({
                label: admin.title,
                value: admin.id,
              }))}
            />
            <NoticeboardDescriptionForm
              initialData={noticeboard}
              adminId={adminId}
              noticeboardId={noticeboardId}
            />
          </div>

          {/* Right Column: Attachments */}
          <div className="space-y-8">
            <div>
              <div className="flex items-center gap-x-2">
                <IconBadge icon={File} />
                <h2 className="text-2xl">Noticeboard Resources & Attachments</h2>
              </div>
              <NoticeboardAttachmentsForm
                initialData={{ attachments: noticeboard.attachments || [] }}
                adminId={adminId}
                noticeboardId={noticeboardId}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default NoticeboardIdPage;