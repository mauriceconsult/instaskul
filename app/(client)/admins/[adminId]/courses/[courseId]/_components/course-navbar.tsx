// app/(client)/admins/[adminId]/courses/[courseId]/_components/course-navbar.tsx
import { Tutor, Course } from "@prisma/client";
import { CourseMobileSidebar } from "./course-mobile-sidebar";
import NavbarRoutes from "@/components/navbar-routes";

interface CourseNavbarProps {
  course: Course & {
    tutors: (Tutor & {
      userProgress: { isCompleted: boolean }[] | null;
    })[];
  };
  progressCount: number;
  adminId: string;
}

export const CourseNavbar = ({ 
  course, 
  progressCount, 
  adminId 
}: CourseNavbarProps) => {
  return (
    <div className="p-4 border-b h-full flex items-center bg-white shadow-sm">
      <CourseMobileSidebar 
        course={course} 
        progressCount={progressCount}
        adminId={adminId}
      />
      <NavbarRoutes />
    </div>
  );
};