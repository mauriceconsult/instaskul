import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { AdminNavbar } from "./_components/admin-navbar";
import { AdminSidebar } from "./_components/admin-sidebar";

export default async function AdminIdLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ adminId: string }>;
}) {
  const { userId } = await auth();
  
  if (!userId) {
    return redirect("/sign-in");
  }

  const { adminId } = await params;

  const admin = await prisma.admin.findUnique({
    where: {
      id: adminId,
      userId, 
    },
  });

  if (!admin) {
    return redirect("/dashboard/admins");
  }
  // 🔍 DEBUG: Log admin in layout
  console.log("AdminIdLayout - admin:", admin);
  console.log("AdminIdLayout - admin.id:", admin.id);

  return (
    <div className="h-full">
      {/* Admin Navbar */}
      <div className="fixed inset-x-0 top-0 z-50 h-[80px] border-b bg-white md:pl-80">
        <AdminNavbar admin={admin} />
      </div>

      {/* Admin Sidebar */}
      <div className="hidden md:flex fixed inset-y-0 z-40 w-80 pt-[80px]">
        <AdminSidebar admin={admin} />
      </div>

      {/* Main Content */}
      <main className="md:pl-80 pt-[80px] h-full bg-gray-50">
        {children}
      </main>
    </div>
  );
}