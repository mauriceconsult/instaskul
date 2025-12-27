"use client";

import { Assignment } from "@prisma/client";
import { useEffect, useState } from "react";
import {
  DragDropContext,
  Draggable,
  Droppable,
  DropResult,
} from "@hello-pangea/dnd";
import { cn } from "@/lib/utils";
import { Grip, Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";

interface TutorAssignmentsListProps {
  items: Assignment[];
  adminId: string;
  courseId: string;
  tutorId: string;
}

export const TutorAssignmentsList = ({ items, adminId, courseId, tutorId }: TutorAssignmentsListProps) => {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [assignments, setAssignments] = useState(items);

  useEffect(() => setIsMounted(true), []);
  useEffect(() => setAssignments(items), [items]);

  const onDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const updated = Array.from(assignments);
    const [moved] = updated.splice(result.source.index, 1);
    updated.splice(result.destination.index, 0, moved);

    setAssignments(updated);

    const reorderData = updated.map((assignment, index) => ({
      id: assignment.id,
      position: index,
    }));

    try {
      await axios.put(`/api/admins/${adminId}/courses/${courseId}/tutors/${tutorId}/assignments/reorder`, { list: reorderData });
      toast.success("Assignments reordered");
      router.refresh();
    } catch {
      toast.error("Failed to reorder");
      setAssignments(items); // revert on error
    }
  };

  const onEdit = (id: string) => {
    router.push(`/dashboard/admins/${adminId}/courses/${courseId}/tutors/${tutorId}/assignments/${id}`);
  };

  if (!isMounted) return null;

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="assignments">
        {(provided) => (
          <div {...provided.droppableProps} ref={provided.innerRef}>
            {assignments.map((assignment, index) => (
              <Draggable key={assignment.id} draggableId={assignment.id} index={index}>
                {(provided) => (
                  <div
                    className={cn(
                      "flex items-center gap-x-2 bg-slate-200 border-slate-200 border text-slate-700 rounded-md mb-4 text-sm",
                      assignment.isPublished && "bg-sky-100 border-sky-200 text-sky-700"
                    )}
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                  >
                    <div
                      {...provided.dragHandleProps}
                      className={cn(
                        "px-2 py-3 border-r border-r-slate-200 hover:bg-slate-300 rounded-l-md transition",
                        assignment.isPublished && "border-r-sky-200 hover:bg-sky-200"
                      )}
                    >
                      <Grip className="h-5 w-5" />
                    </div>
                    {assignment.title}
                    <div className="ml-auto pr-2 flex items-center gap-x-2">
                      <Badge className={cn("bg-slate-500", assignment.isPublished && "bg-sky-700")}>
                        {assignment.isPublished ? "Published" : "Draft"}
                      </Badge>
                      <Pencil
                        onClick={() => onEdit(assignment.id)}
                        className="w-4 h-4 cursor-pointer hover:opacity-75 transition"
                      />
                    </div>
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
};