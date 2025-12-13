"use client";

import { Coursework } from "@prisma/client";
// import { cn } from "@/lib/utils";

interface CourseCourseworkListProps {
  items: Coursework[];
  onEditAction: (id: string) => Promise<{ success: boolean; message: string }>;
}

export const CourseCourseworkList = ({
  items,
  onEditAction,
}: CourseCourseworkListProps) => {
  console.log("CourseCourseworkList items:", items);

  return (
    <div className="mt-4">
      {items.length > 0 ? (
        items.map((coursework) => {
          if (!coursework.id) {
            console.error("Invalid coursework ID:", coursework);
            return null;
          }
          return (
            <div
              key={coursework.id}
              className="p-2 border-b cursor-pointer flex justify-between items-center hover:bg-slate-50"
              onClick={() => {
                console.log("Clicked coursework ID:", coursework.id);
                onEditAction(coursework.id);
              }}
              role="button"
              aria-label={`Edit coursework: ${coursework.title}`}
            >
              <span>{coursework.title}</span>
              {!coursework.isPublished && (
                <span className="text-sm text-slate-500">(Unpublished)</span>
              )}
            </div>
          );
        })
      ) : (
        <p className="text-sm text-slate-500 italic">
          No courseworks available
        </p>
      )}
    </div>
  );
};
