"use client";

import { TutorWithProgressWithCourse } from "@/actions/get-tutors";
import { TutorCard } from "../cards/tutor-card";

interface TutorsListProps {
  items: TutorWithProgressWithCourse[];
}

export const TutorsList = ({ items }: TutorsListProps) => {
  if (items.length === 0) {
    return (
      <div className="text-center text-sm text-muted-foreground mt-10">
        No tutor-cards found
      </div>
    );
  }

  return (
    <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
      {items.map((item) => (
        <TutorCard
          key={item.id}
          id={item.id}
          title={item.title}            
          course={item.course?.title || "Unknown Course"}
          tutorsLength={item.assignmentsCount}
          progress={item.progress}
        />
      ))}
    </div>
  );
};