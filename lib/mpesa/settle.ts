import { prisma } from "@/lib/db";
import { stkQuery } from "@/lib/mpesa/daraja";

// Safaricom decides the outcome, never the request body
export async function reconcile(checkoutRequestId: string, receipt?: string) {
  const q = await stkQuery(checkoutRequestId);
  if (q.state === "PAID") return settleSuccess(checkoutRequestId, receipt);
  if (q.state === "FAILED") return settleFailure(checkoutRequestId, q.reason);
  return "PENDING" as const;
}

async function settleSuccess(checkoutRequestId: string, receipt?: string) {
  return prisma.$transaction(async (tx) => {
    const t = await tx.mPesaTransaction.findFirst({ where: { checkoutRequestId } });
    if (!t) return "NOT_FOUND" as const;
    if (t.status === "COMPLETED") return "COMPLETED" as const; // duplicate callback: nothing to do

    await tx.mPesaTransaction.update({
      where: { id: t.id },
      data: { status: "COMPLETED", mpesaReceiptNumber: receipt, failureReason: null },
    });
    const tuition = await tx.tuition.upsert({
      where: { userId_courseId: { userId: t.userId, courseId: t.courseId } },
      create: {
        userId: t.userId,
        courseId: t.courseId,
        amount: t.amount,
        currency: t.currency,
        status: "SUCCESSFUL",
        isPaid: true,
        momoStatus: "SUCCESSFUL",
        momoReferenceId: t.checkoutRequestId,
        momoNetwork: "MPESA",
        momoPhoneNumber: t.phoneNumber,
        momoTransactionId: receipt,
      },
      update: {
        amount: t.amount,
        currency: t.currency,
        status: "SUCCESSFUL",
        isPaid: true,
        momoStatus: "SUCCESSFUL",
        momoReferenceId: t.checkoutRequestId,
        momoNetwork: "MPESA",
        momoPhoneNumber: t.phoneNumber,
        momoTransactionId: receipt,
      },
    });
    await tx.enrollment.upsert({
      where: { userId_courseId: { userId: t.userId, courseId: t.courseId } },
      create: { userId: t.userId, courseId: t.courseId, tuitionId: tuition.id },
      update: {},
    });
    return "COMPLETED" as const;
  });
}

async function settleFailure(checkoutRequestId: string, reason: string) {
  // A failure is only recorded if the payment was still pending
  await prisma.mPesaTransaction.updateMany({
    where: { checkoutRequestId, status: "PENDING" },
    data: { status: "FAILED", failureReason: reason.slice(0, 200) },
  });
  return "FAILED" as const;
}