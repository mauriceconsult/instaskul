"use client";

import Image from "next/image";
import Link from "next/link";
import { IconBadge } from "../icon-badge";
import { BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

interface TutorCardProps {
  id: string;
  title: string;
  course: string;
  tutorsLength: number;
  progress: number | null; 
}

export const TutorCard = ({
  id,
  title,
  course,
  tutorsLength,
  progress,
}: TutorCardProps) => {
  return (
    <Link href={`/courses/${id}/tutors/${id}`} className="block">
      <div className="group hover:shadow-lg transition overflow-hidden border rounded-lg p-3 h-full bg-white">
        <div className="relative w-full aspect-video rounded-md overflow-hidden">
          <Image
            fill
            className="object-cover group-hover:scale-105 transition"
            alt={title}
            src="/instaskul_logo.svg" // Replace with actual thumbnail if available
          />
        </div>
        <div className="flex flex-col pt-3">
          <h3 className="text-lg font-medium group-hover:text-sky-700 transition line-clamp-2">
            {title}
          </h3>
          <p className="text-sm text-muted-foreground mt-1">{course}</p>

          <div className="my-3 flex items-center gap-x-2 text-sm text-slate-600">
            <IconBadge size="sm" icon={BookOpen} />
            <span>
              {tutorsLength} {tutorsLength === 1 ? "Tutorial" : "Tutorials"}
            </span>
          </div>

          {/* Progress Bar */}
          {progress !== null && (
            <div className="mt-2">
              <div className="flex items-center justify-between text-xs text-slate-600 mb-1">
                <span>Progress</span>
                <span className="font-medium">{progress}%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
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