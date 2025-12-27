"use client";

import { Course, Tutor, UserProgress } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { CourseSidebar } from "./course-sidebar";

interface CourseMobileSidebarProps {
  course: Course & {
    tutors: (Tutor & {
      userProgress: UserProgress[] | null;
    })[];
  };
  progressCount: number;
  isEnrolled: boolean;
}

export const CourseMobileSidebar = ({
  course,
  progressCount,
  isEnrolled,
}: CourseMobileSidebarProps) => {
  const [isOpen, setIsOpen] = useState(false);

  console.log(
    "[CourseMobileSidebar] Course:",
    course.id,
    "Progress:",
    progressCount,
    "Enrolled:",
    isEnrolled
  );

  return (
    <Sheet
      open={isOpen}
      onOpenChange={(open) => {
        console.log("[CourseMobileSidebar] Sheet toggled:", open);
        setIsOpen(open);
      }}
    >
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0 w-80">
        <CourseSidebar
          course={course}
          progressCount={progressCount}
          isEnrolled={isEnrolled}
        />
      </SheetContent>
    </Sheet>
  );
};
