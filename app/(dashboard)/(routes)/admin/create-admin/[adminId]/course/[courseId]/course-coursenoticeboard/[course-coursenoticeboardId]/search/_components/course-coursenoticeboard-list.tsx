"use client";

import { useEffect } from "react";
import { CourseNoticeboardCard } from "@/components/courseNoticeboard-card";
import { CourseNoticeboard } from "@prisma/client";

interface CourseNoticeboardListProps {
  items: CourseNoticeboard[];
}

export const CourseCourseNoticeboardsList = ({
  items,
}: CourseNoticeboardListProps) => {
  useEffect(() => {
    console.log("CourseNoticeboardList items:", items);
  }, [items]);

  return (
    <div className="mt-4">
      {items.length === 0 ? (
        <p className="text-slate-500 italic">No noticeboards available.</p>
      ) : (
        items.map((item) => (
          <CourseNoticeboardCard
            key={item.id}
            id={item.id}
            title={item.title}
            description={item.description ?? ""}
            courseNoticeboard={item.title} // Map course title to courseNoticeboard
          />
        ))
      )}
    </div>
  );
};
