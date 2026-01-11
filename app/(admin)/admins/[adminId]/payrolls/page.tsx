// app/admins/[adminId]/payrolls/page.tsx
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { payrollService } from "@/lib/payroll";
import PayrollClient from "./_components/payroll-client";

export default async function PayrollPage({
  params,
}: {
  params: Promise<{ adminId: string }>;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { adminId } = await params;

  // Verify ownership
  const admin = await prisma.admin.findUnique({
    where: {
      id: adminId,
      userId,
    },
    select: { id: true },
  });

  if (!admin) redirect("/dashboard/admins");

  // Fetch data in parallel
  const [stats, pending, history] = await Promise.all([
    payrollService.getPayrollStats(adminId),
    payrollService.getPendingPayrolls(adminId),
    payrollService.getHistoryPayrolls(adminId, 20), // assuming this method exists
  ]);

  return (
    <PayrollClient
      initialStats={stats}
      pendingPayrolls={pending}
      historyPayrolls={history}
      adminId={adminId}
    />
  );
}