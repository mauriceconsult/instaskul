import { Tutor, Course } from "@prisma/client";
import { CourseMobileSidebar } from "./course-mobile-sidebar";
import NavbarRoutes from "@/components/navbar-routes";

interface CourseNavbarProps {
    course: Course & {
        tutors: (Tutor)[]
    }
}

export const CourseNavbar = ({course}: CourseNavbarProps) => {
    return ( 
        <div className="p-4 border-b h-full flex items-center bg-white shadow-sm">
            <CourseMobileSidebar course={course} />
            <NavbarRoutes/>
        </div>
     );
}
 
