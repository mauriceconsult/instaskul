"use client";

import { useEffect } from "react";
import Link from "next/link";
import { CourseWithProgressWithAdmin } from "@/actions/get-courses";


interface CourseTutorListProps {
  items: CourseWithProgressWithAdmin[];
}

export const CourseTutorList = ({ items }: CourseTutorListProps) => {
  useEffect(() => {
    console.log("CourseTutorList items:", items);
  }, [items]);

  return (
    <div className="mt-2">
      {items.length === 0 ? (
        <p className="text-slate-500 italic">No courses available.</p>
      ) : (
        items.map((course) => (
          <Link
            key={course.id}
            href={`/course/courses/${course.id}`}
            className="flex items-center gap-4 p-2 border-b hover:bg-slate-50 transition"
          >
            <span className="flex-1 font-medium">{course.title}</span>
            <span className="text-sm text-slate-600">
              {course.admin?.title || "No Admin"}
            </span>
            <span className="text-sm text-slate-500">
              {course.tutors.length} {course.tutors.length === 1 ? "Tutorial" : "Tutorials"}
            </span>
          </Link>
        ))
      )}
    </div>
  );
};
