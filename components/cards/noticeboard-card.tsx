"use client";

import Link from "next/link";
import { FileText } from "lucide-react";

interface NoticeboardCardProps {
  id: string;
  title: string;
  description: string;
  adminName: string;
  attachmentsCount: number;
}

export const NoticeboardCard = ({
  id,
  title,
  description,
  adminName,
  attachmentsCount,
}: NoticeboardCardProps) => {
  return (
    <Link href={`/admins/${id}/noticeboards/${id}`} className="group block">
      <div className="border rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition h-full">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <FileText className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-blue-600 transition">
              {title}
            </h3>
            <p className="text-sm text-muted-foreground">By {adminName}</p>
          </div>
        </div>

        <p className="text-sm text-gray-600 line-clamp-3 mt-2">
          {description || "No description available."}
        </p>

        {attachmentsCount > 0 && (
          <p className="text-xs text-muted-foreground mt-3">
            {attachmentsCount} attachment{attachmentsCount !== 1 ? "s" : ""}
          </p>
        )}
      </div>
    </Link>
  );
};