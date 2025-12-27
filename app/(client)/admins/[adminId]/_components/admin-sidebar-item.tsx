"use client";

import { cn } from "@/lib/utils";
import { CheckCircle, Lock } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

interface AdminSidebarItemProps {
  id: string;
  label: string;
  isCompleted: boolean;
  adminId: string;
  isLocked: boolean;
}

export const AdminSidebarItem = ({
  id,
  label,
  isCompleted,
  adminId,
  isLocked,
}: AdminSidebarItemProps) => {
  const pathname = usePathname();
  const router = useRouter();

  const isActive = pathname?.includes(id);

  const onClick = () => {
    if (!isLocked) {
      router.push(`/admins/${adminId}/tutorials/${id}`);
    }
  };

  return (
    <button
      onClick={onClick}
      type="button"
      disabled={isLocked}
      className={cn(
        "flex items-center gap-x-2 text-slate-500 text-sm font-[500] pl-6 transition-all hover:text-slate-600 hover:bg-slate-300/20",
        isActive && "text-slate-700 bg-slate-200/20",
        isCompleted && "text-emerald-700",
        isLocked && "opacity-50 cursor-not-allowed"
      )}
    >
      <div className="flex items-center gap-x-2 py-4">
        {isCompleted ? (
          <CheckCircle className="h-5 w-5" />
        ) : (
          <Lock className="h-5 w-5" />
        )}
        <span>{label}</span>
      </div>
    </button>
  );
};
