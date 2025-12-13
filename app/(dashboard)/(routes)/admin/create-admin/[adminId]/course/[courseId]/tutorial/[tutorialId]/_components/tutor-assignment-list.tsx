"use client";

import { Assignment } from "@prisma/client";
// import { cn } from "@/lib/utils";

interface TutorAssignmentListProps {
  items: Assignment[];
  onEditAction: (id: string) => Promise<{ success: boolean; message: string }>;
}

export const TutorAssignmentList = ({
  items,
  onEditAction,
}: TutorAssignmentListProps) => {
  console.log("TutorAssignmentList items:", items); // Debug log

  return (
    <div className="mt-4">
      {items.length > 0 ? (
        items.map((assignment) => {
          if (!assignment.id) {
            console.error("Invalid assignment ID:", assignment); // Log invalid assignments
            return null; // Skip rendering
          }
          return (
            <div
              key={assignment.id}
              className="p-2 border-b cursor-pointer flex justify-between items-center hover:bg-slate-50"
              onClick={() => {
                console.log("Clicked assignment ID:", assignment.id); // Debug click
                onEditAction(assignment.id);
              }}
              role="button"
              aria-label={`Edit assignment: ${assignment.title}`}
            >
              <span>{assignment.title}</span>
              {!assignment.isPublished && (
                <span className="text-sm text-slate-500">(Unpublished)</span>
              )}
            </div>
          );
        })
      ) : (
        <p className="text-sm text-slate-500 italic">
          No assignments available
        </p>
      )}
    </div>
  );
};
