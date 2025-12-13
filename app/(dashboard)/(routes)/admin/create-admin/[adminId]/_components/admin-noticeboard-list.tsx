"use client";
import { useEffect } from "react";
import { Noticeboard } from "@prisma/client";

interface AdminNoticeboardListProps {
  items: Noticeboard[];
  onEditAction: (id: string) => Promise<{ success: boolean; message: string }>;
}

export const AdminNoticeboardList = ({
  items,
  onEditAction,
}: AdminNoticeboardListProps) => {
  useEffect(() => {
    console.log("AdminNoticeboardList items:", items);
  }, [items]);

  return (
    <div className="mt-2">
      {items.length === 0 ? (
        <p className="text-slate-500 italic">No notices available.</p>
      ) : (
        items.map((notice) => (
          <div key={notice.id} className="flex items-center gap-2 p-2 border-b">
            <span className="flex-1">{notice.title}</span>
            <button
              onClick={() => onEditAction(notice.id)}
              className="text-blue-600 hover:underline text-sm"
            >
              Edit
            </button>
          </div>
        ))
      )}
    </div>
  );
};
