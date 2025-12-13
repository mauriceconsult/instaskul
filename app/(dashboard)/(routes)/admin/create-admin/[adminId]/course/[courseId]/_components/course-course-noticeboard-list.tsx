"use client";

import { CourseNoticeboard } from "@prisma/client";
import { useEffect, useState } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import { cn } from "@/lib/utils";
import {
  Grip,
  Pencil
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import toast from "react-hot-toast";

interface CourseCourseNoticeboardListProps {
  items: CourseNoticeboard[];
  onEditAction: (id: string) => Promise<{ success: boolean; message: string }>;
  onReorderAction: (updateData: { id: string; position: number }[]) => Promise<{
    success: boolean;
    message: string;
  }>;
}

export const CourseCourseNoticeboardList = ({
  items,
  onEditAction,
  onReorderAction,
}: CourseCourseNoticeboardListProps) => {
  const [isMounted, setIsMounted] = useState(false);
  const [courseNoticeboards, setCourseNoticeboards] = useState<CourseNoticeboard[]>(items);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    setCourseNoticeboards(items);
  }, [items]);

  const onDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const newItems = Array.from(courseNoticeboards);
    const [reorderedItem] = newItems.splice(result.source.index, 1);
    newItems.splice(result.destination.index, 0, reorderedItem);

    setCourseNoticeboards(newItems);

    const bulkUpdateData = newItems.map((courseNoticeboard, index) => ({
      id: courseNoticeboard.id,
      position: index,
    }));

    const { success, message } = await onReorderAction(bulkUpdateData);
    if (success) {
      toast.success(message);
    } else {
      toast.error(message);
    }
  };

  if (!isMounted) {
    return null;
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="courseNoticeboards">
        {(provided) => (
          <div {...provided.droppableProps} ref={provided.innerRef}>
            {courseNoticeboards.map((courseNoticeboard, index) => (
              <Draggable key={courseNoticeboard.id} draggableId={courseNoticeboard.id} index={index}>
                {(provided) => (
                  <div
                    className={cn(
                      "flex items-center gap-x-2 bg-slate-200 border-slate-200 border text-slate-700 rounded-md mb-4 text-sm",
                      courseNoticeboard.isPublished &&
                        "bg-sky-100 border-sky-200 text-sky-700"
                    )}
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                  >
                    <div
                      className={cn(
                        "px-2 py-3 border-r border-r-slate-200 hover:bg-slate-300 rounded-l-md transition",
                        courseNoticeboard.isPublished && "border-r-sky-200 hover:bg-sky-200"
                      )}
                      {...provided.dragHandleProps}
                    >
                      <Grip className="h-5 w-5" />
                    </div>
                    <span aria-label={`CourseNoticeboard: ${courseNoticeboard.title || courseNoticeboard.id}`}>
                      {courseNoticeboard.title || courseNoticeboard.id}
                    </span>
                    <div className="ml-auto pr-2 flex items-center gap-x-2">
                      <Badge
                        className={cn(
                          "bg-slate-500",
                          courseNoticeboard.isPublished && "bg-sky-700"
                        )}
                      >
                        {courseNoticeboard.isPublished ? "Published" : "Draft"}
                      </Badge>
                      <Pencil
                        onClick={async () => {
                          const { success, message } = await onEditAction(
                            courseNoticeboard.id
                          );
                          if (!success) {
                            toast.error(message);
                          }
                        }}
                        className="w-4 h-4 cursor-pointer hover:opacity-75 transition"
                        aria-label={`Edit courseNoticeboard: ${courseNoticeboard.title || courseNoticeboard.id}`}
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
