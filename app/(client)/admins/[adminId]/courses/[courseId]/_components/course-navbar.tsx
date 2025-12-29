import { Tutor, Course, Coursework } from "@prisma/client";
import { CourseMobileSidebar } from "./course-mobile-sidebar";
import NavbarRoutes from "@/components/navbar-routes";

interface CourseNavbarProps {
  course: Course & {
    tutors: (Tutor & {
      userProgress: { isCompleted: boolean }[];
    })[];
    courseworks: (Coursework & {
      userProgress: { isCompleted: boolean }[];
    })[];
  };
  courseProgressCount: number;
  courseworkProgressCount: number; // ← Add this
  adminId: string;
}

export const CourseNavbar = ({ 
  course, 
  courseProgressCount,
  courseworkProgressCount, // ← Add this
  adminId 
}: CourseNavbarProps) => {
  return (
    <div className="p-4 border-b h-full flex items-center bg-white shadow-sm">
      <CourseMobileSidebar 
        course={course} 
        courseProgressCount={courseProgressCount}
        courseworkProgressCount={courseworkProgressCount} // ← Pass it down
        adminId={adminId}
      />
      <NavbarRoutes />
    </div>
  );
};