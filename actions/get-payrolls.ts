// actions/get-payrolls.ts
import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";

export async function getPayrolls() {
  const { userId } = await auth();
  if (!userId) return [];

  // Only show payrolls for this admin's school
  const admin = await prisma.admin.findFirst({
    where: { userId },
  });

  if (!admin) return [];

  return await prisma.payroll.findMany({
    where: { adminId: admin.id },
    include: {
      tuition: {
        include: {
          course: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}