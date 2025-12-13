"use client";

import { BarChart, Compass, Layout, List } from "lucide-react";
import { SidebarItem } from "./sidebar-item";
import { usePathname } from "next/navigation";

const guestRoutes = [
  {
    icon: Layout,
    label: "Dashboard",
    href: "/",
  },
  {
    icon: Compass,
    label: "Browse",
    href: "/search",
  },
];

const adminRoutes = [
  {
    icon: List,
    label: "Admins",
    href: "/admin/admins",
  },
  {
    icon: List,
    label: "Courses",
    href: "/admin/courses",
  },
  {
    icon: List,
    label: "Tutorials",
    href: "/admin/tutorials",
  },
  {
    icon: List,
    label: "Noticeboards",
    href: "/admin/noticeboards",
  },
  {
    icon: List,
    label: "Courseworks",
    href: "/admin/courseworks",
  },
  {
    icon: List,
    label: "Assignments",
    href: "/admin/assignments",
  },
  {
    icon: List,
    label: "Course Notices",
    href: "/admin/course-notices",
  },
  {
    icon: List,
    label: "Payrolls",
    href: "/admin/payrolls",
  },
  {
    icon: BarChart,
    label: "Analytics",
    href: "/admin/analytics",
  },
];

export const SidebarRoutes = () => {
  const pathname = usePathname();
  console.log("[SidebarRoutes] Pathname:", pathname);

  // Check for guest or admin routes
  const isGuestRoute = pathname === "/" || pathname === "/search";
  const routes = isGuestRoute ? guestRoutes : adminRoutes;

  return (
    <div className="flex flex-col w-full">
      {routes.map((route) => (
        <SidebarItem
          key={route.href}
          icon={route.icon}
          label={route.label}
          href={route.href}
        />
      ))}
    </div>
  );
};
