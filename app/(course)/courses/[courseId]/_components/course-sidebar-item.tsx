"use client";

import { cn } from "@/lib/utils";
import { CheckCircle, Lock, PlayCircle } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

interface CourseSidebarItemProps {
  id: string;
  label: string;
  isCompleted: boolean;
  courseId: string;
  isLocked: boolean;
}

export const CourseSidebarItem = ({
  id,
  label,
  isCompleted,
  isLocked,
  courseId,
}: CourseSidebarItemProps) => {
  const pathname = usePathname();
  const router = useRouter();
  
  const isActive = pathname?.includes(id);

  const onClick = () => {
    if (!isLocked) {
      router.push(`/courses/${courseId}/tutors/${id}`);
    }
  };

  // Determine icon based on state
  const getIcon = () => {
    if (isLocked) return Lock;
    if (isCompleted) return CheckCircle;
    return PlayCircle;
  };

  const Icon = getIcon();

  return (
    <button
      onClick={onClick}
      type="button"
      disabled={isLocked}
      className={cn(
        "flex items-center gap-x-2 text-slate-500 text-sm font-medium pl-6 py-4 transition-all hover:text-slate-600 hover:bg-slate-100 w-full",
        isActive && "text-slate-700 bg-slate-200/20",
        isCompleted && "text-emerald-700 hover:text-emerald-800",
        isCompleted && isActive && "bg-emerald-200/20",
        isLocked && "opacity-50 cursor-not-allowed hover:bg-transparent"
      )}
    >
      <Icon
        className={cn(
          "h-5 w-5 flex-shrink-0",
          isActive && !isCompleted && "text-slate-700",
          isCompleted && "text-emerald-700"
        )}
      />
      <span className="line-clamp-1 flex-1 text-left">{label}</span>
      
      {/* Active indicator bar */}
      <div
        className={cn(
          "w-1 h-full opacity-0 transition-opacity",
          isActive && "opacity-100",
          isCompleted ? "bg-emerald-700" : "bg-slate-700"
        )}
      />
    </button>
  );
};