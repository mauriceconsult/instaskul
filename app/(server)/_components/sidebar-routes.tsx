"use client"

import { BarChart, Compass, Layout, List } from "lucide-react";
import { SidebarItem } from "./sidebar-item";
import { usePathname } from "next/navigation";

const guestRoutes = [
    {
        icon: Layout,
        label: "Dashboard",
        href: "/dashboard"
    },
    {
        icon: Compass,
        label: "Browse",
        href: "/dashboard/search"
    }
];

const adminRoutes = [
  {
    icon: List,
    label: "Admins",
    href: "/dashboard/admins",
  },
  {
    icon: BarChart,
    label: "Analytics",
    href: "/dashboard/analytics",
  },
];

export const SidebarRoutes = () => {
    const pathname = usePathname();
    
    // Show admin routes when in admin section
    const isAdminSection = pathname?.includes("/dashboard/admins") || pathname?.includes("/dashboard/analytics");
    
    const routes = isAdminSection ? adminRoutes : guestRoutes;
    
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
}