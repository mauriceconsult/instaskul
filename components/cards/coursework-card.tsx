"use client";

import Link from "next/link";
import { IconBadge } from "../icon-badge";
import { BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

interface CourseworkCardProps {
  id: string;
  title: string;
  description: string;
  courseTitle: string;  
  courseworksLength: number;
  progress: number | null;
}

export const CourseworkCard = ({
  id,
  title,
  description,
  courseTitle,
  courseworksLength,
  progress,
}: CourseworkCardProps) => {
  return (
    <Link href={`/admins/${id}/courses/${id}/courseworks/${id}`} className="group block">
      <div className="group hover:shadow-lg transition overflow-hidden border rounded-lg p-4 h-full bg-white">
        <div className="flex flex-col">
          <h3 className="text-lg font-medium group-hover:text-sky-700 transition line-clamp-2">
            {title}
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Course: {courseTitle}
          </p>

          <div className="my-4 flex items-center gap-x-2 text-sm text-slate-600">
            <IconBadge size="sm" icon={BookOpen} />
            <span>
              {courseworksLength} {courseworksLength === 1 ? "Coursework" : "Courseworks"}
            </span>
          </div>

          {description && (
            <p className="text-sm text-gray-600 line-clamp-3 mt-2">
              {description}
            </p>
          )}

          {progress !== null && (
            <div className="mt-4">
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-slate-600">Progress</span>
                <span className="font-medium">{progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={cn(
                    "h-2 rounded-full transition-all",
                    progress === 100 ? "bg-green-600" : "bg-sky-600"
                  )}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};