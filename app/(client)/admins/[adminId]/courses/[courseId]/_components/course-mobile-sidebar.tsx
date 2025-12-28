import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Tutor, Course } from "@prisma/client";
import { Menu } from "lucide-react";
import CourseSidebar from "./course-sidebar";

interface CourseMobileSidebarProps {
    course: Course & {
            tutors: (Tutor)[]
        }
}
export const CourseMobileSidebar = ({course}: CourseMobileSidebarProps) => {
    return (
      <Sheet>
        <SheetTrigger className="md:hidden pr-4 hover:opacity-75 transition">
          <SheetTitle><Menu/></SheetTitle>
        </SheetTrigger>
        <SheetContent side={"left"} className="p-0 bg-white w-72">
          <CourseSidebar course={course} progressCount={0} />
        </SheetContent>
      </Sheet>
    );
}
 
