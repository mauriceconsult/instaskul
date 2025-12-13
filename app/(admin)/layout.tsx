// app/(admin)/layout.tsx
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { AdminNavbar } from "./_components/admin-navbar";
import { AdminSidebar } from "./_components/admin-sidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/");

  const admin = await prisma.admin.findFirst({
    where: { userId },
  });

  if (!admin) redirect("/");

  return (
    <div className="h-full">
      <div className="fixed inset-x-0 top-0 z-50 h-[80px] border-b bg-white">
        <AdminNavbar admin={admin} />
      </div>

      <div className="hidden md:flex fixed inset-y-0 z-40 w-80 pt-[80px]">
        <AdminSidebar admin={admin} />
      </div>

      <AdminNavbar.MobileTrigger admin={admin} />

      <main className="md:pl-80 pt-[80px] h-full bg-gray-50">
        {children}
      </main>
    </div>
  );
}