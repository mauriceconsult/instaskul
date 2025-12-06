// app/(admin)/(sidebar)/admin-navbar.tsx
import { Admin } from "@prisma/client";
import { AdminMobileSidebar } from "./admin-mobile-sidebar";
import NavbarRoutes from "@/components/navbar-routes";

interface AdminNavbarProps {
  admin: Admin;   
}

export const AdminNavbar = ({ admin }: AdminNavbarProps) => {
  return (
    <div className="p-4 border-b h-[80px] flex items-center bg-white shadow-sm fixed top-0 left-0 right-0 z-50">
      {/* Mobile menu */}
      <AdminMobileSidebar admin={admin} />

      {/* Right-side user menu / logout */}
      <div className="ml-auto">
        <NavbarRoutes />
      </div>
    </div>
  );
};