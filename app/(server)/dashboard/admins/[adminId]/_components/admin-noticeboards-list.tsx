"use client";

import { Noticeboard } from "@prisma/client";
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

interface AdminNoticeboardsListProps {
  items: Noticeboard[];
  adminId: string;
}

export const AdminNoticeboardsList = ({ items, adminId }: AdminNoticeboardsListProps) => {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [noticeboards, setNoticeboards] = useState(items);

  useEffect(() => setIsMounted(true), []);
  useEffect(() => setNoticeboards(items), [items]);

  const onDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const updated = Array.from(noticeboards);
    const [moved] = updated.splice(result.source.index, 1);
    updated.splice(result.destination.index, 0, moved);

    setNoticeboards(updated);

    const reorderData = updated.map((nb, index) => ({
      id: nb.id,
      position: index,
    }));

    try {
      await axios.put(`/api/admins/${adminId}/noticeboards/reorder`, { list: reorderData });
      toast.success("Noticeboards reordered");
      router.refresh();
    } catch {
      toast.error("Failed to reorder");
      setNoticeboards(items); // revert on error
    }
  };

  const onEdit = (id: string) => {
    router.push(`/dashboard/admins/${adminId}/noticeboards/${id}`);
  };

  if (!isMounted) return null;

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="noticeboards">
        {(provided) => (
          <div {...provided.droppableProps} ref={provided.innerRef}>
            {noticeboards.map((noticeboard, index) => (
              <Draggable key={noticeboard.id} draggableId={noticeboard.id} index={index}>
                {(provided) => (
                  <div
                    className={cn(
                      "flex items-center gap-x-2 bg-slate-200 border-slate-200 border text-slate-700 rounded-md mb-4 text-sm",
                      noticeboard.isPublished && "bg-sky-100 border-sky-200 text-sky-700"
                    )}
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                  >
                    <div
                      {...provided.dragHandleProps}
                      className={cn(
                        "px-2 py-3 border-r border-r-slate-200 hover:bg-slate-300 rounded-l-md transition",
                        noticeboard.isPublished && "border-r-sky-200 hover:bg-sky-200"
                      )}
                    >
                      <Grip className="h-5 w-5" />
                    </div>
                    {noticeboard.title}
                    <div className="ml-auto pr-2 flex items-center gap-x-2">
                      <Badge className={cn("bg-slate-500", noticeboard.isPublished && "bg-sky-700")}>
                        {noticeboard.isPublished ? "Published" : "Draft"}
                      </Badge>
                      <Pencil
                        onClick={() => onEdit(noticeboard.id)}
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