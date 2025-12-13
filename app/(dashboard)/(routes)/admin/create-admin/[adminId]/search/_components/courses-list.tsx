"use client";

import { CourseCard } from "@/components/course-card";
import { Admin, Course } from "@prisma/client";

type CoursesWithProgressWithAdmin = Course & {
  admin: Admin | null;
  tutors: { id: string }[];
  progress: number | null;
};

interface CoursesListProps {
  items: CoursesWithProgressWithAdmin[];
}

export const CoursesList = ({ items }: CoursesListProps) => {
  return (
    <div>
      <div className="grid sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-4">
        {items.map((item) => (
          <CourseCard
            key={item.id}
            id={item.id}
            title={item.title}
            imageUrl={item.imageUrl!}
            tutorialsLength={item.tutors.length}
            description={item.description ?? ""}
            progress={item.progress}
            admin={item?.admin?.title ?? ""}
          />
        ))}
      </div>
      {items.length === 0 && (
        <div className="text-center text-sm text-muted-foreground mt-10">
          No Courses found.
        </div>
      )}
    </div>
  );
};
