// components/courses-list.tsx
"use client";

import { CourseWithProgressWithAdmin } from "@/actions/get-courses";
import { CourseCard } from "../cards/course-card";

interface CoursesListProps {
  items: CourseWithProgressWithAdmin[];
}

export const CoursesList = ({ items }: CoursesListProps) => {
  if (items.length === 0) {
    return (
      <div className="text-center text-sm text-muted-foreground mt-10">
        No courses found
      </div>
    );
  }

  return (
    <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
      {items.map((item) => (
        <CourseCard
          key={item.id}
          id={item.id}
          title={item.title}
          imageUrl={item.imageUrl || "/placeholder-course.jpg"}
          description={item.description || ""}
          admin={item.admin?.title || "Unknown Admin"}
          tutorialsLength={item.tutors.length}
          progress={item.progress}
        />
      ))}
    </div>
  );
};