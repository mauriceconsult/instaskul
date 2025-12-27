import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { IconBadge } from "@/components/icon-badge";
import { ArrowLeft, File, LayoutDashboard } from "lucide-react";
import Link from "next/link";
import { Banner } from "@/components/banner";
import { CourseworkActions } from "./_components/coursework-actions";
import { CourseworkCourseForm } from "./_components/coursework-course-form";
import { CourseworkDescriptionForm } from "./_components/coursework-description-form";
import { CourseworkTitleForm } from "./_components/coursework-title-form";
import { CourseworkAttachmentsForm } from "./_components/coursework-attachments-form";

const CourseworkIdPage = async ({
  params,
}: {
  params: Promise<{ adminId: string; courseId: string; courseworkId: string }>;
}) => {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { adminId, courseId, courseworkId } = await params;

  const coursework = await prisma.coursework.findUnique({
    where: {
      id: courseworkId,
      courseId,
      course: { adminId },
    },
    include: {
      attachments: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!coursework) {
    console.error(`Coursework not found: ${courseworkId}`);
    redirect("/dashboard");
  }

  const courses = await prisma.course.findMany({
    where: { adminId },
    orderBy: { title: "asc" },
  });

  const requiredFields = [
    coursework.title,
    coursework.description,
    coursework.courseId,
  ];

  const totalFields = requiredFields.length;
  const completedFields = requiredFields.filter(Boolean).length;
  const completionText = `(${completedFields}/${totalFields})`;
  const isComplete = requiredFields.every(Boolean);

  return (
    <>
      {!coursework.isPublished && (
        <Banner
          variant="warning"
          label="This coursework is unpublished. Complete the required* fields to publish."
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
            <h1 className="text-3xl font-bold">Coursework setup</h1>
            <span className="text-sm text-slate-600">
              Complete all fields {completionText}
            </span>
          </div>
          <CourseworkActions
            disabled={!isComplete}
            adminId={adminId}
            courseId={courseId}
            courseworkId={courseworkId}
            isPublished={coursework.isPublished}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-8">
            <div className="flex items-center gap-x-2">
              <IconBadge icon={LayoutDashboard} />
              <h2 className="text-2xl">Customize</h2>
            </div>
            <CourseworkTitleForm
              initialData={{ title: coursework.title }}
              adminId={adminId}
              courseId={courseId}
              courseworkId={courseworkId}
            />
            <CourseworkCourseForm
              initialData={coursework}
              adminId={adminId}
              courseId={courseId}
              courseworkId={courseworkId}
              options={courses.map((course) => ({
                label: course.title,
                value: course.id,
              }))}
            />
            <CourseworkDescriptionForm
              initialData={coursework}
              adminId={adminId}
              courseId={courseId}
              courseworkId={courseworkId}
            />
          </div>

          <div className="space-y-8">
            <div>
              <div className="flex items-center gap-x-2">
                <IconBadge icon={File} />
                <h2 className="text-2xl">Coursework Resources & Attachments</h2>
              </div>
              <CourseworkAttachmentsForm
                initialData={{ attachments: coursework.attachments || [] }}
                adminId={adminId}
                courseId={courseId}
                courseworkId={courseworkId}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CourseworkIdPage;