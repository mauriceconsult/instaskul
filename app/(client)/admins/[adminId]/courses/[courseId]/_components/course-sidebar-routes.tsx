"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Video, Bell, ClipboardList, BarChart } from "lucide-react";
import { cn } from "@/lib/utils";

interface CourseSidebarRoutesProps {
  adminId: string;
  courseId: string;
}

export const CourseSidebarRoutes = ({ adminId, courseId }: CourseSidebarRoutesProps) => {
  const pathname = usePathname();

  const routes = [
    {
      icon: LayoutDashboard,
      label: "Overview",
      href: `/admins/${adminId}/courses/${courseId}`,
    },
    {
      icon: Video,
      label: "Tutorials",
      href: `/admins/${adminId}/courses/${courseId}/tutors`,
    },
    {
      icon: ClipboardList, // ← Fixed: was LayoutDashboard
      label: "Courseworks",
      href: `/admins/${adminId}/courses/${courseId}/courseworks`,
    },
    {
      icon: Bell,
      label: "Noticeboards", // ← Shortened from "Course notices"
      href: `/admins/${adminId}/courses/${courseId}/coursenoticeboards`,
    },
    {
      icon: BarChart,
      label: "Analytics",
      href: `/admins/${adminId}/courses/${courseId}/analytics`,
    },
  ];

  return (
    <div className="flex-1 py-4">
      {routes.map((route) => (
        <Link
          key={route.href}
          href={route.href}
          className={cn(
            "flex items-center gap-x-3 px-6 py-4 text-sm font-medium transition-colors hover:bg-slate-100",
            pathname === route.href && "bg-sky-50 text-sky-700 border-r-4 border-sky-700"
          )}
        >
          <route.icon className="h-5 w-5" />
          <span>{route.label}</span>
        </Link>
      ))}
    </div>
  );
};