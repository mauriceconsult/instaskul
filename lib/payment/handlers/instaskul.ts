// lib/payments/handlers/instaskul.ts

import { prisma } from "@/lib/prisma";
import { payrollService } from "@/lib/payroll";
import { MoMoWebhookPayload } from "@/lib/payments/momo";

export async function handleInstaskul(
  payload: MoMoWebhookPayload
): Promise<void> {
  const {
    referenceId,
    status,
    financialTransactionId,
  } = payload;
    

  //
  // COLLECTIONS (Course payment)
  //
  if (referenceId.startsWith("COL-")) {
    const tuition = await prisma.tuition.findUnique({
      where: {
        momoReferenceId: referenceId,
      },
      include: {
  course: {
    include: {
      admin: {
        select: {
          userId: true,
        },
      },
    },
  },
        },
    });

    if (!tuition) {
      console.warn(
        "[MoMo] Tuition not found:",
        referenceId
      );
      return;
    }

    // idempotency
    if (tuition.momoStatus === "SUCCESSFUL") {
      return;
    }

 if (status !== "SUCCESSFUL") {
    await prisma.tuition.update({
        where: { id: tuition.id },
        data: {
            momoStatus: status,
        },
    });

    console.warn("[MoMo] Collection failed", {
        referenceId,
        tuitionId: tuition.id,
        status,
    });

    return;
}

    await prisma.$transaction(async (tx) => {
      await tx.tuition.update({
        where: {
          id: tuition.id,
        },
        data: {
          momoStatus: "SUCCESSFUL",
          momoTransactionId:
            financialTransactionId ?? null,
          isPaid: true,
        },
      });
        console.info("[MoMo] Collection processed", {
    referenceId,
    transactionId: financialTransactionId,
    tuitionId: tuition.id,
    courseId: tuition.courseId,
    studentId: tuition.userId,
    status,
});

        // create enrollment
        if (!tuition.courseId) {
  throw new Error("Tuition has no courseId.");
}

      await tx.enrollment.upsert({
        where: {
          userId_courseId: {
            userId: tuition.userId,
            courseId: tuition.courseId,
          },
        },
        update: {},
        create: {
          userId: tuition.userId,
          courseId: tuition.courseId,
          tuitionId: tuition.id,
        },
      });

        // create payroll
        const instructorId = tuition.course?.admin?.userId;
        if (!tuition.course) {
    throw new Error("Course not found.");
}

if (!instructorId) {
  throw new Error("Course instructor not found.");
}

     const amount = Number(tuition.amount);

if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("Invalid tuition amount.");
}
                   const payrollReference =
  `PAY-${Date.now()}-${instructorId.slice(0, 8)}`;

const payroll =
    payrollService.calculatePayroll(amount);

        await tx.payroll.upsert({
 
          where: {
                tuitionId: tuition.id,
              
           
          },
          update: {},
          create: {
            tuitionId: tuition.id,
            userId: instructorId,
            instructorId: instructorId,
            adminId: tuition.course?.adminId ?? instructorId,
            courseId: tuition.courseId,
            grossAmount: payroll.grossAmount.toString(),
            platformFee: payroll.platformFee.toString(),
            transactionFee: payroll.transactionFee.toString(),
            netPayout: payroll.netPayout.toString(),
            currency: tuition.currency ?? "UGX",
              momoStatus: "PENDING",
            momoReferenceId: payrollReference,
    
          },
        });
    });

    return;
  }

  //
  // DISBURSEMENTS (Tutor payment)
  //
  if (referenceId.startsWith("PAY-")) {
 await prisma.payroll.updateMany({
  where: {
    momoReferenceId: referenceId,
  },
  data: {
    momoStatus: status,
    momoTransactionId: financialTransactionId ?? null,
    paidAt:
      status === "SUCCESSFUL"
        ? new Date()
        : null,
  },
 });
      console.info("[MoMo] Payroll updated", {
    referenceId,
    transactionId: financialTransactionId,
    status,
});

    return;
  }

  console.warn(
    "[MoMo] Unknown Instaskul reference:",
    referenceId
  );
}