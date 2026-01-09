import { prisma } from "@/lib/db";
import { momo } from "@/lib/momo";
import {
    ClientPayroll,
    PayrollStats,
    PayrollStatus,
} from "@/types/payroll";
import { Prisma } from "@prisma/client";

interface PayrollCalculation {
  grossAmount: string;
  platformFee: string;
  transactionFee: string;
  netPayout: string;
}

// Type for Prisma payroll with includes
type PayrollWithRelations = Prisma.PayrollGetPayload<{
  include: {
    course: { select: { title: true; imageUrl: true } };
    tuition: { select: { createdAt: true; isPaid: true; amount: true } };
  };
}>;

class PayrollService {
  /**
   * Calculate payroll using integer arithmetic (UGX whole numbers)
   * Input can be number or string, output is always string
   */
  calculatePayroll(tuitionAmount: number | string): PayrollCalculation {
    // Convert string to number if needed
    const amount = typeof tuitionAmount === "string" 
      ? parseInt(tuitionAmount, 10) 
      : tuitionAmount;

    if (!Number.isInteger(amount) || amount < 0) {
      throw new Error("Tuition amount must be a non-negative integer (UGX)");
    }

    const grossAmount = amount;
    const platformFee = Math.round(grossAmount * 0.10); // 10%
    const transactionFee = Math.round(grossAmount * 0.02); // 2%
    const netPayout = grossAmount - platformFee - transactionFee;

    return {
      grossAmount: grossAmount.toString(),
      platformFee: platformFee.toString(),
      transactionFee: transactionFee.toString(),
      netPayout: netPayout.toString(),
    };
  }

  /**
   * Serialize Prisma payroll to client-safe format
   */
  serializePayroll(payroll: PayrollWithRelations): ClientPayroll {
    return {
      id: payroll.id,
      grossAmount: payroll.grossAmount,
      platformFee: payroll.platformFee,
      transactionFee: payroll.transactionFee,
      netPayout: payroll.netPayout,
      momoStatus: payroll.momoStatus,
      momoReferenceId: payroll.momoReferenceId ?? undefined,
      createdAt: payroll.createdAt.toISOString(),
      paidAt: payroll.paidAt ? payroll.paidAt.toISOString() : undefined,
      course: {
        title: payroll.course.title,
        imageUrl: payroll.course.imageUrl ?? undefined,
      },
      tuition: {
        isPaid: payroll.tuition.isPaid,
        createdAt: payroll.tuition.createdAt.toISOString(),
        amount: payroll.tuition.amount ?? undefined,
      },
    };
  }

  /**
   * Create payroll record after successful tuition payment
   */
  async createPayrollRecord({
    tuitionId,
    userId,
    courseId,
    adminId,
    tuitionAmount,
  }: {
    tuitionId: string;
    userId: string;
    courseId: string;
    adminId: string;
    tuitionAmount: number | string;
  }) {
    const calculation = this.calculatePayroll(tuitionAmount);

    return await prisma.payroll.create({
      data: {
        tuitionId,
        userId,
        courseId,
        adminId,
        grossAmount: calculation.grossAmount,
        platformFee: calculation.platformFee,
        transactionFee: calculation.transactionFee,
        netPayout: calculation.netPayout,
        momoStatus: "PENDING",
      },
    });
  }

  /**
   * Validate phone number format
   */
  private validatePhoneNumber(phoneNumber: string): void {
    if (!/^\+256[0-9]{9}$/.test(phoneNumber)) {
      throw new Error("Invalid phone number. Format: +256XXXXXXXXX");
    }
  }

  /**
   * Process a single disbursement
   */
  async processDisbursement(payrollId: string, phoneNumber: string) {
    this.validatePhoneNumber(phoneNumber);

    return await prisma.$transaction(async (tx) => {
      const payroll = await tx.payroll.findUnique({
        where: { id: payrollId },
        include: { 
          course: { select: { title: true } },
        },
      });

      if (!payroll) {
        throw new Error("Payroll record not found");
      }

      if (payroll.momoStatus !== "PENDING") {
        throw new Error(`Payroll already processed: ${payroll.momoStatus}`);
      }

      // netPayout is stored as string in DB
      const netAmount = payroll.netPayout;
      
      // Validate it's a valid number string
      const netAmountNum = parseInt(netAmount, 10);
      if (!Number.isInteger(netAmountNum) || netAmountNum <= 0) {
        throw new Error("Invalid net payout amount");
      }

      // Initiate MoMo transfer - send as string
      const payload = {
        amount: netAmount,
        currency: "UGX",
        externalId: `payroll_${payroll.id}_${Date.now()}`,
        payee: { 
          partyIdType: "MSISDN" as const, 
          partyId: phoneNumber 
        },
        payerMessage: `Instaskul Earnings - ${payroll.course.title}`,
        payeeNote: `Payout for: ${payroll.course.title}`,
      };

      const referenceId = await momo.disbursements.transfer(payload);

      // Update payroll status
      await tx.payroll.update({
        where: { id: payrollId },
        data: {
          momoReferenceId: referenceId,
          momoStatus: "PROCESSING",
        },
      });

      return { success: true, referenceId };
    });
  }

  /**
   * Process batch disbursements
   */
  async processBatchDisbursement(payrollIds: string[], phoneNumber: string) {
    this.validatePhoneNumber(phoneNumber);

    const results = {
      successful: [] as string[],
      failed: [] as { id: string; error: string }[],
    };

    for (const id of payrollIds) {
      try {
        await this.processDisbursement(id, phoneNumber);
        results.successful.push(id);
      } catch (error: any) {
        results.failed.push({
          id,
          error: error.message || "Disbursement failed",
        });
      }
    }

    return results;
  }

  /**
   * Check and update disbursement status
   */
  async checkDisbursementStatus(payrollId: string) {
    const payroll = await prisma.payroll.findUnique({
      where: { id: payrollId },
      select: { 
        momoReferenceId: true, 
        momoStatus: true 
      },
    });

    if (!payroll?.momoReferenceId) {
      throw new Error("No MoMo reference ID found");
    }

    try {
      const status = await momo.disbursements.getTransactionStatus(
        payroll.momoReferenceId
      );

      // Cast to PayrollStatus for type safety
      const momoStatus = status.status as PayrollStatus;

      const updated = await prisma.payroll.update({
        where: { id: payrollId },
        data: {
          momoStatus,
          paidAt: momoStatus === "SUCCESSFUL" ? new Date() : null,
        },
      });

      return { status: momoStatus, payroll: updated };
    } catch (error) {
      console.error("[PAYROLL_STATUS_CHECK]", error);
      throw error;
    }
  }

  /**
   * Base query for admin payrolls
   */
  private async getPayrollsWithRelations(
    adminId: string,
    momoStatus?: PayrollStatus | PayrollStatus[]
  ) {
    return await prisma.payroll.findMany({
      where: {
        adminId,
        ...(momoStatus && {
          momoStatus: Array.isArray(momoStatus) 
            ? { in: momoStatus } 
            : momoStatus
        }),
      },
      include: {
        course: { 
          select: { 
            title: true, 
            imageUrl: true 
          } 
        },
        tuition: { 
          select: { 
            createdAt: true, 
            isPaid: true, 
            amount: true 
          } 
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  /**
   * Get pending payrolls
   */
  async getPendingPayrolls(adminId: string): Promise<ClientPayroll[]> {
    const payrolls = await this.getPayrollsWithRelations(adminId, "PENDING");
    return payrolls.map((p) => this.serializePayroll(p));
  }

  /**
   * Get history payrolls
   */
  async getHistoryPayrolls(
    adminId: string, 
    limit = 20
  ): Promise<ClientPayroll[]> {
    // ✅ Use const assertion to ensure type-safe status array
    const historyStatuses: PayrollStatus[] = ["PROCESSING", "SUCCESSFUL", "FAILED"];
    
    const payrolls = await prisma.payroll.findMany({
      where: {
        adminId,
        momoStatus: { in: historyStatuses },
      },
      include: {
        course: { select: { title: true, imageUrl: true } },
        tuition: { select: { createdAt: true, isPaid: true, amount: true } },
      },
      orderBy: { updatedAt: "desc" },
      take: limit,
    });

    return payrolls.map((p) => this.serializePayroll(p));
  }

  /**
   * Get payroll statistics
   * All amounts in DB are strings, parse them for calculations
   */
  async getPayrollStats(adminId: string): Promise<PayrollStats> {
    const payrolls = await prisma.payroll.findMany({
      where: { adminId },
      select: {
        grossAmount: true,
        platformFee: true,
        transactionFee: true,
        netPayout: true,
        momoStatus: true,
      },
    });

    return payrolls.reduce(
      (stats, p) => {
        // Parse string amounts to numbers for calculations
        const gross = parseInt(p.grossAmount, 10);
        const net = parseInt(p.netPayout, 10);
        const platform = parseInt(p.platformFee, 10);
        const transaction = parseInt(p.transactionFee, 10);

        stats.totalEarnings += gross;
        stats.platformFeesTotal += platform;
        stats.transactionFeesTotal += transaction;
        stats.totalTransactions++;

        // ✅ Type-safe status checking
        const status = p.momoStatus as PayrollStatus;
        
        switch (status) {
          case "PENDING":
            stats.availableBalance += net;
            stats.pendingCount++;
            break;
          case "PROCESSING":
            stats.processingAmount += net;
            stats.processingCount++;
            break;
          case "SUCCESSFUL":
            stats.paidAmount += net;
            stats.successfulCount++;
            break;
          case "FAILED":
            stats.failedCount++;
            break;
        }

        return stats;
      },
      {
        totalEarnings: 0,
        availableBalance: 0,
        processingAmount: 0,
        paidAmount: 0,
        platformFeesTotal: 0,
        transactionFeesTotal: 0,
        totalTransactions: 0,
        pendingCount: 0,
        processingCount: 0,
        successfulCount: 0,
        failedCount: 0,
      }
    );
  }
}

export const payrollService = new PayrollService();