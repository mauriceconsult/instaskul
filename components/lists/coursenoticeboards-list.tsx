"use client";

import { CourseNoticeboardWithCourse } from "@/actions/get-courseNoticeboards";
import { CourseNoticeboardCard } from "../cards/courseNoticeboard-card";

interface CourseNoticeboardsListProps {
  items: CourseNoticeboardWithCourse[];
}

export const CourseNoticeboardsList = ({ items }: CourseNoticeboardsListProps) => {
  if (items.length === 0) {
    return (
      <div className="text-center text-sm text-muted-foreground mt-10">
        No coursenoticeboards found
      </div>
    );
  }

  return (
    <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
      {items.map((item) => (
        <CourseNoticeboardCard
          key={item.id}
          id={item.id}
          title={item.title}
          description={item.description || ""}
          course={item.course}       
        />
      ))}
    </div>
  );
};