// app/(admin)/(sidebar)/admin-sidebar.tsx
import { Admin } from "@prisma/client";
import { LayoutDashboard, BookOpen, School, Wallet, Settings } from "lucide-react";
import { AdminSidebarItem } from "./admin-sidebar-item";
import { InstaSkulLogo } from "@/components/instaskul-logo";

interface AdminSidebarProps {
  admin: Admin;   // Only this!
}

const adminRoutes = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/admin" },
  { icon: BookOpen,       label: "Courses",   href: "/admin/courses" },
  { icon: School,         label: "School",    href: "/admin/school" },
  { icon: Wallet,         label: "Payroll",   href: "/admin/payroll" },
  { icon: Settings,       label: "Settings",  href: "/admin/settings" },
];

export const AdminSidebar = ({ admin }: AdminSidebarProps) => {
  return (
    <div className="h-full border-r flex flex-col overflow-y-auto bg-white shadow-sm">
      <div className="p-6 border-b">
        <InstaSkulLogo />
        {admin.title && (
          <p className="text-sm text-muted-foreground mt-2 truncate">
            {admin.title}
          </p>
        )}
      </div>

      <div className="flex-1 py-4">
        {adminRoutes.map((route) => {
          const props: any = { icon: route.icon, label: route.label, href: route.href };
          return (
            <AdminSidebarItem
              key={route.href}
              {...props}
            />
          );
        })}
      </div>
    </div>
  );
};