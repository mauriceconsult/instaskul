"use client";

import { Noticeboard } from "@prisma/client";
import { NoticeboardItem } from "./noticeboard-item";

interface NoticeboardItemProps {
  items: Noticeboard[];
}
export const Notices = ({ items }: NoticeboardItemProps) => {
  return (
    <div className="flex items-center gap-x-2 overflow-x-auto pb-2">
      {items.map((item) => (
        <NoticeboardItem key={item.id} label={item.title} value={item.id} />
      ))}
    </div>
  );
};
