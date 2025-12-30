"use client";

import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { AdminSidebar } from "./admin-sidebar";
import { Admin } from "@prisma/client";

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
      <SheetContent side="left" className="p-0 w-80">
        <AdminSidebar admin={admin} />
      </SheetContent>
    </Sheet>
  );
};