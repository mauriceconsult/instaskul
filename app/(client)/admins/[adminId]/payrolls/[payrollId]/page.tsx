import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import PayrollClient from "./payroll-client";

export default async function PayrollPage() {
  const { userId } = await auth();
  if (!userId) redirect("/");

  const admin = await prisma.admin.findFirst({
    where: { userId },
  });

  if (!admin) redirect("/dashboard/admins");

  // Fetch PAID payrolls and sum netPayout manually
  const paidPayrolls = await prisma.payroll.findMany({
    where: {
      adminId: admin.id,
      momoStatus: "PAID",
    },
    select: {
      netPayout: true,
    },
  });

  const availableBalance = paidPayrolls.reduce((sum, payroll) => {
    return sum + Number(payroll.netPayout || "0");
  }, 0);

  return <PayrollClient initialBalance={availableBalance} adminId={admin.id} />;
}