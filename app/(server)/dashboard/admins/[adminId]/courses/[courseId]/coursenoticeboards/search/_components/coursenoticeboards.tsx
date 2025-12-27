"use client";

import { CourseNoticeboard } from "@prisma/client";
import { CourseNoticeboardItem } from "./coursenoticeboard-item";


interface CourseNoticeboardsProps {
  items: CourseNoticeboard[];
}

export const CourseNoticeboards = ({ items }: CourseNoticeboardsProps) => {
  return (
    <div className="flex items-center gap-x-2 overflow-x-auto pb-2">
      {items.map((item) => (
        <CourseNoticeboardItem
          key={item.id}
          label={item.title}          
          value={item.id}
        />
      ))}
    </div>
  );
};
