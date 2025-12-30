"use client";

import { Admin } from "@prisma/client";
import { AdminMobileSidebar } from "./admin-mobile-sidebar";

interface AdminNavbarProps {
  admin: Admin;
}

export const AdminNavbar = ({ admin }: AdminNavbarProps) => {
  return (
    <div className="p-4 border-b h-[80px] flex items-center bg-white shadow-sm w-full z-50">
      <AdminMobileSidebar admin={admin} />
      <div className="ml-auto">
        <p className="text-sm font-medium">{admin.title}</p>
      </div>
    </div>
  );
};

// Export as a separate component instead
export const AdminNavbarMobileTrigger = ({ admin }: { admin: Admin }) => {
  return <AdminMobileSidebar admin={admin} />;
};