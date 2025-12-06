"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminSidebarItemProps {
  icon: LucideIcon;
  label: string;
  href: string;
}

export const AdminSidebarItem = ({ icon: Icon, label, href }: AdminSidebarItemProps) => {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-x-3 px-6 py-4 text-sm font-medium transition-colors hover:bg-slate-100",
        isActive && "bg-sky-50 text-sky-700 border-r-4 border-sky-700"
      )}
    >
      <Icon className="h-5 w-5" />
      <span>{label}</span>
    </Link>
  );
};