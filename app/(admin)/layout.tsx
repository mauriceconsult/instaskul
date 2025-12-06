import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";

import { prisma } from "@/lib/db";
import { AdminNavbar } from "./_components/admin-navbar";
import { AdminSidebar } from "./_components/admin-sidebar";
import { AdminMobileSidebar } from "./_components/admin-mobile-sidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // userId is not a unique field in the Prisma Admin model, so use findFirst to query by it
  const admin = await prisma.admin.findFirst({
    where: { userId },
  });

  // If admin hasn't completed onboarding → send them there
  if (!admin) {
    redirect("/onboarding"); // or wherever your onboarding flow starts
  }

  return (
    <div className="h-full relative">
      {/* Fixed top navbar */}
      <div className="h-[80px] fixed inset-x-0 top-0 z-50 bg-white border-b">
        <AdminNavbar admin={admin} />
      </div>

      {/* Desktop sidebar */}
      <div className="hidden md:flex h-full w-72 fixed inset-y-0 z-40 pt-[80px]">
        <AdminSidebar admin={admin} />
      </div>

      {/* Mobile sidebar trigger (inside navbar) */}
      <AdminMobileSidebar admin={admin} />

      {/* Main content */}
      <main className="md:pl-72 pt-[80px] h-full">
        {children}
      </main>
    </div>
  );
}