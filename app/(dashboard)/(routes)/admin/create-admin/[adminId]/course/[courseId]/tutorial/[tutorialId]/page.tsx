import React from "react";
import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import {
  LayoutDashboard,
  ListChecks,
  File,
  ArrowLeft,
  Eye,
  Video,
} from "lucide-react";
import { IconBadge } from "@/components/icon-badge";
import { Banner } from "@/components/banner";
import Link from "next/link";
import { DashboardLayout } from "@/components/dashboard-layout";
import { TutorActions } from "./_components/tutor-actions";
import { TutorTitleForm } from "./_components/tutor-title-form";
import { TutorCourseForm } from "./_components/tutor-course-form";
import { TutorDescriptionForm } from "./_components/tutor-description-form";
import { TutorAccessForm } from "./_components/tutor-access-form";
import { TutorVideoForm } from "./_components/tutor-video-form";
import { TutorAttachmentForm } from "./_components/tutor-attachment-form";
import { TutorAssignmentForm } from "./_components/tutor-assignment-form";

export const dynamic = "force-dynamic";

const TutorIdPage = async ({
  params,
}: {
  params: Promise<{
    adminId: string;
    courseId: string;
    tutorialId: string;
  }>;
}) => {
  const { userId } = await auth();
  if (!userId) {
    console.error(
      `[${new Date().toISOString()} TutorIdPage] No userId from auth`
    );
    return redirect("/");
  }

  const resolvedParams = await params;
  console.log("TutorIdPage params:", resolvedParams);

  if (
    !resolvedParams.tutorialId ||
    !resolvedParams.courseId ||
    !resolvedParams.adminId
  ) {
    console.error(
      `[${new Date().toISOString()} TutorIdPage] Invalid params`,
      resolvedParams
    );
    return redirect(
      `/admin/create-admin/${resolvedParams.adminId}/course/${resolvedParams.courseId}`
    );
  }

  const tutor = await prisma.tutor.findUnique({
    where: {
      id: resolvedParams.tutorialId,
      courseId: resolvedParams.courseId,
      userId,
    },
    include: {
      muxData: true,
      attachments: true,
      assignments: {
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!tutor) {
    console.error(
      `[${new Date().toISOString()} TutorIdPage] Tutor not found:`,
      {
        tutorId: resolvedParams.tutorialId,
        courseId: resolvedParams.courseId,
        userId,
      }
    );
    return redirect(
      `/admin/create-admin/${resolvedParams.adminId}/course/${resolvedParams.courseId}`
    );
  }

  const course = await prisma.course.findMany({
    select: {
      id: true,
      title: true,
    },
    orderBy: {
      title: "asc",
    },
  });

  if (course.length === 0) {
    console.error(`[${new Date().toISOString()} TutorIdPage] No courses found`);
    return redirect(`/admin/create-admin/${resolvedParams.adminId}`);
  }

  const initialData = {
    ...tutor,
    description: tutor.description ?? "",
    videoUrl: tutor.videoUrl ?? null,
    muxData: tutor.muxData ?? null,
    attachments: tutor.attachments ?? [],
    assignments: tutor.assignments ?? [],
  };

  const requiredFields = [
    initialData.title,
    initialData.courseId,
    initialData.description,
    initialData.videoUrl,
    initialData.assignments.length > 0,
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
          label="This Tutorial is unpublished. To publish, upload a good quality video of your tutorial and at least one published assignment."
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
                <h1 className="text-2xl font-medium">Tutorial creation</h1>
                <div className="text-sm text-slate-700">
                  <div>Completed fields {completionText}</div>
                </div>
              </div>
              <TutorActions
                disabled={!isComplete}
                adminId={resolvedParams.adminId}
                courseId={resolvedParams.courseId}
                tutorialId={tutor.id}
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
                <h2 className="text-xl">Enter tutorial details</h2>
              </div>
              <TutorTitleForm
                initialData={initialData}
                adminId={resolvedParams.adminId}
                courseId={resolvedParams.courseId}
                tutorialId={tutor.id}
              />
              <TutorCourseForm
                initialData={initialData}
                adminId={resolvedParams.adminId}
                courseId={resolvedParams.courseId}
                tutorialId={tutor.id}
                options={course.map((cat) => ({
                  label: cat.title,
                  value: cat.id,
                }))}
              />
              <TutorDescriptionForm
                initialData={initialData}
                adminId={resolvedParams.adminId}
                courseId={resolvedParams.courseId}
                tutorialId={tutor.id}
              />
            </div>
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-x-2">
                  <IconBadge icon={Eye} />
                  <h2 className="text-xl">Access settings</h2>
                </div>
                <TutorAccessForm
                  initialData={initialData}
                  adminId={resolvedParams.adminId}
                  courseId={resolvedParams.courseId}
                  tutorialId={tutor.id}
                />
              </div>
              <div>
                <div className="flex items-center gap-x-2">
                  <IconBadge icon={Video} />
                  <h2 className="text-xl">Add a tutorial video</h2>
                </div>
                <TutorVideoForm
                  initialData={initialData}
                  adminId={resolvedParams.adminId}
                  courseId={resolvedParams.courseId}
                  tutorialId={tutor.id}
                />
              </div>
              <div>
                <div className="flex items-center gap-x-2">
                  <IconBadge icon={File} />
                  <h2 className="text-xl">Resources & attachments</h2>
                </div>
                <TutorAttachmentForm
                  initialData={initialData}
                  adminId={resolvedParams.adminId}
                  courseId={resolvedParams.courseId}
                  tutorialId={tutor.id}
                />
              </div>
              <div>
                <div className="flex items-center gap-x-2">
                  <IconBadge icon={ListChecks} />
                  <h2 className="text-xl">Tutorial assignments</h2>
                </div>
                <TutorAssignmentForm
                  initialData={initialData}
                  adminId={resolvedParams.adminId}
                  courseId={resolvedParams.courseId}
                  tutorialId={tutor.id}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default TutorIdPage;
