import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { AdminNavbar } from "./_components/admin-navbar";
import { AdminSidebar } from "./_components/admin-sidebar";
import { headers } from "next/headers";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  // Get current pathname to detect if we're on the admin homepage
  const pathname = headers().get("x-pathname") || "";
  const isAdminHomepage = pathname === "dashboard/admins";

  // Only enforce admin existence on pages OTHER than the homepage
  if (!isAdminHomepage) {
    const admin = await prisma.admin.findFirst({
      where: { userId },
    });

    if (!admin) {
      // Send to homepage to create/setup admin
      redirect("/dashboard/admins");
    }
  }

  // Fetch admin for navbar/sidebar (safe — null if on homepage)
  const admin = await prisma.admin.findFirst({
    where: { userId },
  });

  return (
    <div className="h-full">
      <div className="fixed inset-x-0 top-0 z-50 h-[80px] border-b bg-white">
        {admin && <AdminNavbar admin={admin} />}
      </div>

      <div className="hidden md:flex fixed inset-y-0 z-40 w-80 pt-[80px]">
        {admin && <AdminSidebar admin={admin} />}
      </div>

      {admin && <AdminNavbar.MobileTrigger admin={admin} />}

      <main className="md:pl-80 pt-[80px] h-full bg-gray-50">
        {children}
      </main>
    </div>
  );
}