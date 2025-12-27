"use client";

import { Course, Tutor, UserProgress } from "@prisma/client";
import { CourseSidebarItem } from "./course-sidebar-item";
import { InstaSkulLogo } from "@/components/instaskul-logo";

interface CourseSidebarProps {
  course: Course & {
    tutors: (Tutor & {
      userProgress: UserProgress[] | null;
    })[];
  };
  progressCount: number;
  isEnrolled: boolean;
}

export const CourseSidebar = ({
  course,
  progressCount,
  isEnrolled,
}: CourseSidebarProps) => {
  console.log(
    "[CourseSidebar] Course:",
    course.id,
    "Progress:",
    progressCount,
    "Enrolled:",
    isEnrolled
  );

  return (
    <div className="h-full border-r flex flex-col overflow-y-auto shadow-sm">
      <div className="p-4 border-b">
        <InstaSkulLogo size="sm" />
      </div>
      <div className="p-8 flex flex-col border-b">
        <h1 className="font-semibold">{course.title}</h1>
        <p className="text-sm">Progress: {progressCount}%</p>
        {isEnrolled ? (
          <p className="text-sm text-green-600">Enrolled</p>
        ) : (
          <p className="text-sm text-red-600">Not enrolled</p>
        )}
      </div>
      <div className="flex flex-col w-full">
        {course.tutors.map((tutor) => (
          <CourseSidebarItem
            key={tutor.id}
            id={tutor.id}
            label={tutor.title}
            isCompleted={!!tutor.userProgress?.[0]?.isCompleted}
            courseId={course.id}
            isLocked={!tutor.isFree && !isEnrolled}
          />
        ))}
      </div>
    </div>
  );
};
