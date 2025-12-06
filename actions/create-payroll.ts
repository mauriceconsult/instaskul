// actions/create-payroll.ts
import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";

export async function createPayrollFromTuition(tuitionId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const tuition = await prisma.tuition.findUnique({
    where: { id: tuitionId },
    include: {
      course: {
        include: { admin: true }
      }
    }
  });

  // Safety checks
  if (!tuition?.isPaid || !tuition.amount || !tuition.courseId || !tuition.course?.adminId) {
    return;
  }

  // Prevent double payroll
  const existing = await prisma.payroll.findUnique({
    where: { tuitionId }
  });
  if (existing) return;

  const gross = parseFloat(tuition.amount);

  const platformFee = (gross * 0.10).toFixed(2);
  const transactionFee = (gross * 0.025).toFixed(2);
  const netPayout = (gross * 0.875).toFixed(2);

  await prisma.payroll.create({
    data: {
      userId,
      tuitionId: tuition.id,
      courseId: tuition.courseId,
      adminId: tuition.course.adminId,
      grossAmount: tuition.amount,
      platformFee,
      transactionFee,
      netPayout,
      momoStatus: "PENDING",
    },
  });
}