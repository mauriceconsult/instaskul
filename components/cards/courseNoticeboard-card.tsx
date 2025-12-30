"use client";

import Link from "next/link";
import { Course } from "@prisma/client";

interface CourseNoticeboardCardProps {
  id: string;
  title: string;
  description: string;
  course: Course | null; 
}

export const CourseNoticeboardCard = ({
  id,
  title,
  description,
  course,
}: CourseNoticeboardCardProps) => {
  return (
    <Link href={`/courses/${id}/coursenoticeboards/${id}`}>
      <div className="group hover:shadow-md transition overflow-hidden border rounded-lg p-3 h-full bg-white">
        <div className="flex flex-col pt-2">
          <h3 className="text-lg font-medium group-hover:text-sky-700 transition line-clamp-2">
            {title}
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            Course: {course?.title || "Unknown Course"}
          </p>
          {description && (
            <p className="text-sm text-gray-600 mt-3 line-clamp-3">
              {description}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
};