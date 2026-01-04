import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { IconBadge } from "@/components/icon-badge";
import { ArrowLeft, File, LayoutDashboard } from "lucide-react";
import Link from "next/link";
import { Banner } from "@/components/banner";
import { AssignmentActions } from "./_components/assignment-actions";
import { AssignmentTitleForm } from "./_components/assignment-title-form";
import { AssignmentTutorForm } from "./_components/assignment-tutor-form";
import { AssignmentDescriptionForm } from "./_components/assignment-description-form";
import { AssignmentsAttachmentsForm } from "./_components/assignments-attachments-form";

const AssignmentIdPage = async ({
  params,
}: {
  params: Promise<{ adminId: string; courseId: string; tutorId: string; assignmentId: string }>;
}) => {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { adminId, courseId, tutorId, assignmentId } = await params;

  const assignment = await prisma.assignment.findUnique({
    where: {
      id: assignmentId,
      tutorId,
      tutor: { courseId },
    },
    include: {
      attachments: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!assignment) {
    console.error(`Assignment not found: ${assignmentId}`);
    redirect("/dashboard");
  }

  const tutors = await prisma.tutor.findMany({
    where: { courseId },
    orderBy: { title: "asc" },
  });

  const requiredFields = [
    assignment.title,
    assignment.description,
    assignment.tutorId,
  ];

  const totalFields = requiredFields.length;
  const completedFields = requiredFields.filter(Boolean).length;
  const completionText = `(${completedFields}/${totalFields})`;
  const isComplete = requiredFields.every(Boolean);

  return (
    <>
      {!assignment.isPublished && (
        <Banner
          variant="warning"
          label="This assignment is unpublished. Complete the required fields to publish."
        />
      )}
      <div className="p-6">
        <Link
          href={`/dashboard/admins/${adminId}/courses/${courseId}/tutors/${tutorId}`}
          className="flex items-center text-sm hover:opacity-75 transition mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to tutorial setup
        </Link>

        <div className="flex items-center justify-between mb-8">
          <div className="flex flex-col gap-y-2">
            <h1 className="text-3xl font-bold">Assignment setup</h1>
            <span className="text-sm text-slate-600">
              Complete all fields {completionText}
            </span>
          </div>
          <AssignmentActions
            disabled={!isComplete}
            adminId={adminId}
            courseId={courseId}
            tutorId={tutorId}
            assignmentId={assignmentId}
            isPublished={assignment.isPublished}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-8">
            <div className="flex items-center gap-x-2">
              <IconBadge icon={LayoutDashboard} />
              <h2 className="text-2xl">Customize</h2>
            </div>
            <AssignmentTitleForm
              initialData={{ title: assignment.title }}
              adminId={adminId}
              courseId={courseId}
              tutorId={tutorId}
              assignmentId={assignmentId}
            />
            <AssignmentTutorForm
              initialData={assignment}
              adminId={adminId}
              courseId={courseId}
              tutorId={tutorId}
              assignmentId={assignmentId}
              options={tutors.map((tutor) => ({
                label: tutor.title,
                value: tutor.id,
              }))}
            />
            <AssignmentDescriptionForm
              initialData={assignment}
              adminId={adminId}
              courseId={courseId}
              tutorId={tutorId}
              assignmentId={assignmentId}
            />
          </div>

          <div className="space-y-8">
            <div>
              <div className="flex items-center gap-x-2">
                <IconBadge icon={File} />
                <h2 className="text-2xl">Assignment resources & attachments</h2>
              </div>
              <AssignmentsAttachmentsForm
                initialData={{ attachments: assignment.attachments || [] }}
                adminId={adminId}
                courseId={courseId}
                tutorId={tutorId}
                assignmentId={assignmentId}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AssignmentIdPage;