"use client";

import { AssignmentWithProgressWithTutor } from "@/actions/get-assignments";
import { AssignmentCard } from "../cards/assignment-card";

interface AssignmentsListProps {
  items: AssignmentWithProgressWithTutor[];
}

export const AssignmentsList = ({ items }: AssignmentsListProps) => {
  if (items.length === 0) {
    return (
      <div className="text-center text-sm text-muted-foreground mt-10">
        No assignment-cards found
      </div>
    );
  }

  return (
    <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
      {items.map((item) => (
        <AssignmentCard
  key={item.id}
  id={item.id}
  title={item.title}
  description={item.description || ""}
  tutorId={item.tutorId!}
  assignmentsLength={item.attachments.length || 0}
  progress={item.progress}
/>
      ))}
    </div>
  );
};