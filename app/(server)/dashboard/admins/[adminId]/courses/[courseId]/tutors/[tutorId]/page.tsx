import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { IconBadge } from "@/components/icon-badge";
import { ArrowLeft, Eye, File, LayoutDashboard, ListChecks } from "lucide-react";
import Link from "next/link";
import { Banner } from "@/components/banner";
import { TutorTitleForm } from "./_components/tutor-title-form";
import { TutorDescriptionForm } from "./_components/tutor-description-form";
import { TutorActions } from "./_components/tutor-actions";
import { TutorCourseForm } from "./_components/tutor-course-form";
import { TutorVideoForm } from "./_components/tutor-video-form";
import { TutorAssignmentsForm } from "./_components/tutor-assignment-form";
import { TutorAttachmentsForm } from "./_components/tutor-attachments-form";
import { TutorAccessForm } from "./_components/tutor-access-form";

const TutorIdPage = async ({
  params,
}: {
  params: Promise<{ adminId: string; courseId: string; tutorId: string }>;
}) => {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { adminId, courseId, tutorId } = await params;

  const tutor = await prisma.tutor.findUnique({
    where: {
      id: tutorId,
      courseId,
      course: { adminId },
    },
    include: {
      attachments: { orderBy: { createdAt: "desc" } },
      assignments: { orderBy: { position: "asc" } },
    },
  });

  if (!tutor) {
    console.error(`Tutor not found: ${tutorId}`);
    redirect("/dashboard");
  }

  const courses = await prisma.course.findMany({
    where: { adminId },
    orderBy: { title: "asc" },
  });

  const requiredFields = [
    tutor.title,
    tutor.description,
    tutor.videoUrl,
    tutor.courseId,
  ];

  const totalFields = requiredFields.length;
  const completedFields = requiredFields.filter(Boolean).length;
  const completionText = `(${completedFields}/${totalFields})`;
  const isComplete = requiredFields.every(Boolean);

  return (
    <>
      {!tutor.isPublished && (
        <Banner
          variant="warning"
          label="This tutorial is unpublished. Complete all required fields to publish."
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
            <h1 className="text-3xl font-bold">Tutorial setup</h1>
            <span className="text-sm text-slate-600">
              Complete all fields {completionText}
            </span>
          </div>
          <TutorActions
            disabled={!isComplete}
            adminId={adminId}
            courseId={courseId}
            tutorId={tutorId}
            isPublished={tutor.isPublished}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column: Core Customization */}
          <div className="space-y-8">
            <div className="flex items-center gap-x-2">
              <IconBadge icon={LayoutDashboard} />
              <h2 className="text-2xl">Customize Tutorial</h2>
            </div>

            <TutorTitleForm
              initialData={{ title: tutor.title }}
              adminId={adminId}
              courseId={courseId}
              tutorId={tutorId}
            />
            <TutorCourseForm
              initialData={tutor}
              adminId={adminId}
              courseId={courseId}
              tutorId={tutorId}
              options={courses.map((course) => ({
                label: course.title,
                value: course.id,
              }))}
            />
            <TutorDescriptionForm
              initialData={tutor}
              adminId={adminId}
              courseId={courseId}
              tutorId={tutorId}
            />
              
            <TutorVideoForm
              initialData={tutor}
              adminId={adminId}
              courseId={courseId}
              tutorId={tutorId}
            />
          </div>

          {/* Right Column: Content & Resources */}
          <div className="space-y-8">
             <div>
              <div className="flex items-center gap-x-2">
                <IconBadge icon={Eye} />
                <h2 className="text-2xl">Tutorial access</h2>
              </div>
             <TutorAccessForm
                initialData={tutor}
                adminId={(await params).adminId}
                courseId={(await params).courseId}
                tutorId={(await params).tutorId}
              />
            </div>
            <div>
              <div className="flex items-center gap-x-2">
                <IconBadge icon={ListChecks} />
                <h2 className="text-2xl">Assignments</h2>
              </div>
              <TutorAssignmentsForm
                initialData={{ assignments: tutor.assignments || [] }}
                adminId={adminId}
                courseId={courseId}
                tutorId={tutorId}
              />
            </div>

            <div>
              <div className="flex items-center gap-x-2">
                <IconBadge icon={File} />
                <h2 className="text-2xl">Attachments & Resources</h2>
              </div>
              <TutorAttachmentsForm
                initialData={{ attachments: tutor.attachments || [] }}
                adminId={adminId}
                courseId={courseId}
                tutorId={tutorId}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TutorIdPage;