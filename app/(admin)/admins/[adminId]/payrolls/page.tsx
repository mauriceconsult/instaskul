import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { payrollService } from "@/lib/payroll";
import PayrollClient from "./_components/payroll-client";

export default async function PayrollPage({
  params,
}: {
  params: { adminId: string };
}) {
  const { userId } = await auth();
  if (!userId) redirect("/");

  // Verify admin ownership
  const admin = await prisma.admin.findFirst({
    where: { 
      id: params.adminId, 
      userId 
    },
  });

  if (!admin) redirect("/dashboard/admins");

  // Fetch all data in parallel using payrollService
  const [stats, pendingPayrolls, historyPayrolls] = await Promise.all([
    payrollService.getPayrollStats(admin.id),
    payrollService.getPendingPayrolls(admin.id),
    payrollService.getHistoryPayrolls(admin.id, 20),
  ]);

  return (
    <PayrollClient
      initialStats={stats}
      pendingPayrolls={pendingPayrolls}
      historyPayrolls={historyPayrolls}
      adminId={admin.id}
    />
  );
}