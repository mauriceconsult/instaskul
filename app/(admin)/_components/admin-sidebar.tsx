"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, BookOpen, Wallet, Settings } from "lucide-react";
import { Admin } from "@prisma/client";

interface AdminSidebarProps {
  admin: Admin;
}

const routes = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/admin" },
  { icon: BookOpen, label: "Courses", href: "/admin/courses" },
  { icon: Wallet, label: "Payroll", href: "/admin/payroll" },  
  { icon: Settings, label: "Settings", href: "/admin/settings" },
];

export const AdminSidebar = ({ admin }: AdminSidebarProps) => {
  const pathname = usePathname();

  return (
    <div className="h-full border-r flex flex-col overflow-y-auto bg-white shadow-sm">
      <div className="p-6 border-b">
        <h1 className="text-2xl font-bold">Instaskul Admin</h1>
        <p className="text-sm text-muted-foreground mt-1">{admin.title}</p>
      </div>
      <div className="flex-1 py-4">
        {routes.map((route) => (
          <Link
            key={route.href}
            href={route.href}
            className={`flex items-center gap-x-3 px-6 py-4 text-sm font-medium transition-colors hover:bg-slate-100 ${
              pathname === route.href ? "bg-sky-50 text-sky-700 border-r-4 border-sky-700" : ""
            }`}
          >
            <route.icon className="h-5 w-5" />
            <span>{route.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
};