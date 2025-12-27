"use client";

import { Assignment } from "@prisma/client";
import { AssignmentItem } from "./assignment-item";


interface AssignmentsProps {
  items: Assignment[];
}

export const Assignments = ({ items }: AssignmentsProps) => {
  return (
    <div className="flex items-center gap-x-2 overflow-x-auto pb-2">
      {items.map((item) => (
        <AssignmentItem
          key={item.id}
          label={item.title}          
          value={item.id}
        />
      ))}
    </div>
  );
};
