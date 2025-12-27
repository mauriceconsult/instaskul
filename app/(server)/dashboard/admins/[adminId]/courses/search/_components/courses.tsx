"use client";

import { Course } from "@prisma/client";
import { CourseItem } from "./course-item";


interface CoursesProps {
  items: Course[];
}

export const Courses = ({ items }: CoursesProps) => {
  return (
    <div className="flex items-center gap-x-2 overflow-x-auto pb-2">
      {items.map((item) => (
        <CourseItem
          key={item.id}
          label={item.title}          
          value={item.id}
        />
      ))}
    </div>
  );
};
