// app/(client)/admins/[adminId]/courses/[courseId]/_components/course-sidebar-item.tsx
"use client";

import { cn } from "@/lib/utils";
import { CircleArrowRight } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

interface CourseSidebarItemProps {
  label: string;
  id: string;
  courseId: string;
  adminId?: string;
}

const CourseSidebarItem = ({ label, id, courseId, adminId }: CourseSidebarItemProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const Icon = CircleArrowRight;
  
  const isActive = pathname?.includes(id);
  
  const onClick = () => {
    // Extract adminId from current path if not provided
    const pathAdminId = adminId || pathname?.split('/')[2];
    router.push(`/admins/${pathAdminId}/courses/${courseId}/tutors/${id}`);
  };

  return (
    <button
      onClick={onClick}
      type="button"
      className={cn(
        "flex items-center gap-x-2 text-slate-500 text-sm font-[500] pl-6 transition-all hover:text-slate-600 hover:bg-slate-300/20",
        isActive &&
          "text-slate-700 bg-slate-200/20 hover:bg-slate-200/20 hover:text-slate-700"
      )}
    >
      <div className="flex items-center gap-x-2 py-4">
        <Icon
          size={22}
          className={cn("text-slate-500", isActive && "text-slate-700")}
        />
        {label}
      </div>
      <div
        className={cn(
          "ml-auto opacity-0 border-2 border-slate-700 h-full transition-all",
          isActive && "opacity-100"
        )}
      />
    </button>
  );
};

export default CourseSidebarItem;