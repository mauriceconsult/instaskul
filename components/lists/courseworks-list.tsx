"use client";

import { CourseworkWithProgressWithCourse } from "@/actions/get-courseworks";
import { CourseworkCard } from "../cards/coursework-card";

interface CourseworksListProps {
  items: CourseworkWithProgressWithCourse[];
}

export const CourseworksList = ({ items }: CourseworksListProps) => {
  if (items.length === 0) {
    return (
      <div className="text-center text-sm text-muted-foreground mt-10">
        No courseworks found
      </div>
    );
  }

  return (
    <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
      {items.map((item) => (
        <CourseworkCard
  key={item.id}
  id={item.id}
  title={item.title}
  description={item.description || ""}
  courseTitle={item.course?.title || "Unknown Course"}
  courseworksLength={item.attachments?.length || 0} // or actual count
  progress={item.progress}
/>
      ))}
    </div>
  );
};