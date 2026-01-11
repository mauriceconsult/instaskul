"use client";

import { Admin } from "@prisma/client";
import { AdminMobileSidebar } from "./admin-mobile-sidebar";
import NavbarRoutes from "@/components/navbar-routes";

interface AdminNavbarProps {
  admin: Admin;
}

export const AdminNavbar = ({ admin }: AdminNavbarProps) => {
  // 🔍 DEBUG: Log the admin object
  console.log("AdminNavbar - admin object:", admin);
  console.log("AdminNavbar - admin.id:", admin?.id);
  
  return (
    <div className="p-4 border-b h-[80px] flex items-center bg-white shadow-sm w-full z-50">
      <AdminMobileSidebar admin={admin} />
      
      {/* Pass adminId explicitly */}
      <div className="flex-1">
        <NavbarRoutes adminId={admin?.id} />
      </div>
      
      <div className="ml-auto">
        <p className="text-sm font-medium">{admin?.title}</p>
      </div>
    </div>
  );
};