// components/noticeboards-list.tsx
"use client";

import { NoticeboardWithRelations } from "@/actions/get-noticeboards";
import { NoticeboardCard } from "../noticeboard-card";

interface NoticeboardsListProps {
  items: NoticeboardWithRelations[];
}

export const NoticeboardsList = ({ items }: NoticeboardsListProps) => {
  if (items.length === 0) {
    return (
      <div className="text-center text-sm text-muted-foreground mt-10">
        No noticeboards found
      </div>
    );
  }

  return (
    <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
      {items.map((item) => (
        <NoticeboardCard
          key={item.id}
          id={item.id}
          title={item.title}
          description={item.description || ""}
          adminName={item.admin?.title || "Unknown Admin"}
          attachmentsCount={item.attachments.length}
        />
      ))}
    </div>
  );
};