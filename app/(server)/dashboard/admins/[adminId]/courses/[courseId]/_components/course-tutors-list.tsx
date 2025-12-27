"use client";

import { Tutor } from "@prisma/client";
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

interface CourseTutorsListProps {
  items: Tutor[];
  adminId: string;
  courseId: string;
}

export const CourseTutorsList = ({ items, adminId, courseId }: CourseTutorsListProps) => {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [courses, setTutors] = useState(items);

  useEffect(() => setIsMounted(true), []);
  useEffect(() => setTutors(items), [items]);

  const onDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const updated = Array.from(courses);
    const [moved] = updated.splice(result.source.index, 1);
    updated.splice(result.destination.index, 0, moved);

    setTutors(updated);

    const reorderData = updated.map((nb, index) => ({
      id: nb.id,
      position: index,
    }));

    try {
      await axios.put(`/api/admins/${adminId}/courses/${courseId}/tutors/reorder`, { list: reorderData });
      toast.success("Tutors reordered");
      router.refresh();
    } catch {
      toast.error("Failed to reorder");
      setTutors(items); // revert on error
    }
  };

  const onEdit = (id: string) => {
    router.push(`/dashboard/admins/${adminId}/courses/${courseId}/tutors/${id}`);
  };

  if (!isMounted) return null;

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="courses">
        {(provided) => (
          <div {...provided.droppableProps} ref={provided.innerRef}>
            {courses.map((course, index) => (
              <Draggable key={course.id} draggableId={course.id} index={index}>
                {(provided) => (
                  <div
                    className={cn(
                      "flex items-center gap-x-2 bg-slate-200 border-slate-200 border text-slate-700 rounded-md mb-4 text-sm",
                      course.isPublished && "bg-sky-100 border-sky-200 text-sky-700"
                    )}
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                  >
                    <div
                      {...provided.dragHandleProps}
                      className={cn(
                        "px-2 py-3 border-r border-r-slate-200 hover:bg-slate-300 rounded-l-md transition",
                        course.isPublished && "border-r-sky-200 hover:bg-sky-200"
                      )}
                    >
                      <Grip className="h-5 w-5" />
                    </div>
                    {course.title}
                    <div className="ml-auto pr-2 flex items-center gap-x-2">
                      <Badge className={cn("bg-slate-500", course.isPublished && "bg-sky-700")}>
                        {course.isPublished ? "Published" : "Draft"}
                      </Badge>
                      <Pencil
                        onClick={() => onEdit(course.id)}
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