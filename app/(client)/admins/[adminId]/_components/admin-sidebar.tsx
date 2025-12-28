"use client";

import { Admin } from "@prisma/client";
import { AdminSidebarRoutes } from "./admin-sidebar-routes";
import { InstaSkulLogo } from "@/components/instaskul-logo";

interface AdminSidebarProps {
  admin: Admin;
}

export const AdminSidebar = ({ admin }: AdminSidebarProps) => {
  return (
    <div className="h-full border-r flex flex-col overflow-y-auto bg-white shadow-sm">
      <div className="p-6 border-b">
        <InstaSkulLogo />
        <p className="text-sm text-muted-foreground mt-2">{admin.title}</p>
      </div>
      <AdminSidebarRoutes adminId={admin.id} />
    </div>
  );
};