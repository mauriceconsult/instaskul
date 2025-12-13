"use client";

import { Banner } from "@/components/banner";
import { IconBadge } from "@/components/icon-badge";
import { Course, Tutor, Attachment } from "@prisma/client";
import { ArrowLeft, LayoutDashboard } from "lucide-react";
import Link from "next/link";
import { TutorActions } from "./tutor-actions";
import { TutorTitleForm } from "./tutor-title-form";
import { TutorObjectiveForm } from "./tutor-objective-form";
import { TutorDescriptionForm } from "./tutor-description-form";

interface TutorIdPageClientProps {
  tutor: Tutor & { attachments: Attachment[] };
  course: Course;
  adminId: string;
  courseId: string;
  tutorialId: string;
}

export default function TutorIdPageClient({
  tutor,
  course,
  adminId,
  courseId,
  tutorialId,
}: TutorIdPageClientProps) {
  const requiredFields = [
    tutor.title,
    tutor.courseId,
    tutor.description,
    tutor.objective,
  ];
  const totalFields = requiredFields.length;
  const completedFields = requiredFields.filter(Boolean).length;
  const completionText = `(${completedFields} of ${totalFields})`;
  const isComplete = requiredFields.every(Boolean);

  return (
    <>
      {!tutor.isPublished && (
        <Banner
          variant="warning"
          label="This tutorial is not published yet. You can continue editing it, but it won't be visible to students until you publish it."
        />
      )}
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div className="w-full">
            <Link
              className="flex items-center text-sm hover:opacity-75 transition mb-6"
              href={`/admin/create-admin/${adminId}/course/${courseId}`}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Course creation
            </Link>
            <div className="flex items-center justify-between w-full">
              <div className="flex flex-col gap-y-2">
                <h1 className="text-2xl font-medium">Tutor creation</h1>
                <span className="text-sm text-slate-700">
                  Complete all fields {completionText}
                </span>
                <span className="text-sm text-slate-700">
                  Course: {course.title}
                </span>
              </div>
              <TutorActions
                disabled={!isComplete}
                adminId={adminId}
                courseId={courseId}
                tutorialId={tutorialId}
                isPublished={tutor.isPublished}
              />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-16">
          <div className="space-y-4">
            <div>
              <div className="flex items-center gap-x-2">
                <IconBadge icon={LayoutDashboard} />
                <h2 className="text-xl">Customize your tutor</h2>
              </div>
              <TutorTitleForm
                initialData={{ title: tutor.title }}
                adminId={adminId}
                courseId={courseId}
                tutorialId={tutorialId}
              />
              <TutorObjectiveForm
                initialData={{ objective: tutor.objective }}
                adminId={adminId}
                courseId={courseId}
                tutorialId={tutorialId}
              />
              <TutorDescriptionForm
                initialData={{ description: tutor.description }}
                adminId={adminId}
                courseId={courseId}
                tutorialId={tutorialId}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}