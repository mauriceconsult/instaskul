"use client";

import { Course, Tutor, UserProgress } from "@prisma/client";
import { CourseMobileSidebar } from "./course-mobile-sidebar";
import NavbarRoutes from "@/components/navbar-routes";

interface CourseNavbarProps {
  course: Course & {
    tutors: (Tutor & {
      userProgress: UserProgress[] | null;
    })[];
  };
  progressCount: number;
  isEnrolled: boolean;
}

export const CourseNavbar = ({
  course,
  progressCount,
  isEnrolled,
}: CourseNavbarProps) => {
  console.log(
    "[CourseNavbar] Course:",
    course.id,
    "Progress:",
    progressCount,
    "Enrolled:",
    isEnrolled
  );
  return (
    <div className="p-4 border-b h-[80px] flex items-center bg-white shadow-sm w-full z-50">
      <CourseMobileSidebar
        course={course}
        progressCount={progressCount}
        isEnrolled={isEnrolled}
      />
      <NavbarRoutes
        // className="flex-1"
      />
    </div>
  );
};
