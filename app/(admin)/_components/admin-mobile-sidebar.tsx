// app/(admin)/(sidebar)/admin-mobile-sidebar.tsx
"use client";

import { Admin } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { AdminSidebar } from "./admin-sidebar";

interface AdminMobileSidebarProps {
  admin: Admin;
}

export const AdminMobileSidebar = ({ admin }: AdminMobileSidebarProps) => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0 w-72">
        <AdminSidebar admin={admin} />
      </SheetContent>
    </Sheet>
  );
};