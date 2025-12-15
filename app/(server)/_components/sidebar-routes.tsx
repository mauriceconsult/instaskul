"use client"

import { BarChart, Compass, Layout, List } from "lucide-react";
import { SidebarItem } from "./sidebar-item";
import { usePathname } from "next/navigation";

const guestRoutes = [
    {
        icon: Layout,
        label: "Home",
        href: "/"
    },
    {
        icon: Compass,
        label: "Browse",
        href: "/search"
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
    const isAdminPage = pathname?.includes("/dashboard");
    const routes = isAdminPage ? adminRoutes : guestRoutes;
    
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
 
