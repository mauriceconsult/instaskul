// actions/create-payroll.ts
import { payrollService } from "@/lib/payroll";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";

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

  if (!tuition?.isPaid || !tuition.amount || !tuition.courseId || !tuition.course?.adminId) {
    return;
  }

  const existing = await prisma.payroll.findUnique({
    where: { tuitionId }
  });
  if (existing) return;

  // Use the service method with instructorId
  return await payrollService.createPayrollRecord({
    tuitionId: tuition.id,
    userId,
    courseId: tuition.courseId,
    adminId: tuition.course.adminId,
    instructorId: tuition.course.adminId, // ADD THIS - instructor is the course admin
    tuitionAmount: tuition.amount,
  });
}