import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { payrollService } from "@/lib/payroll";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { payrollIds, type = "single", phoneNumber } = body;

    if (!phoneNumber) {
      return NextResponse.json(
        { error: "Phone number is required" },
        { status: 400 }
      );
    }

    // Validate phone number format
    if (!/^\+256[0-9]{9}$/.test(phoneNumber)) {
      return NextResponse.json(
        { error: "Invalid phone number format. Use +256XXXXXXXXX" },
        { status: 400 }
      );
    }

    // Get admin record
    const admin = await prisma.admin.findFirst({
      where: { userId },
    });

    if (!admin) {
      return NextResponse.json({ error: "Admin not found" }, { status: 404 });
    }

    // Verify ownership of payrolls
    const idsToProcess = Array.isArray(payrollIds) ? payrollIds : [payrollIds];
    
    if (!idsToProcess || idsToProcess.length === 0) {
      return NextResponse.json(
        { error: "No payroll IDs provided" },
        { status: 400 }
      );
    }

    const payrolls = await prisma.payroll.findMany({
      where: {
        id: { in: idsToProcess },
        adminId: admin.id,
        momoStatus: "PENDING",
      },
    });

    if (payrolls.length === 0) {
      return NextResponse.json(
        { error: "No valid pending payrolls found" },
        { status: 404 }
      );
    }

    if (payrolls.length !== idsToProcess.length) {
      return NextResponse.json(
        { error: "Some payrolls not found or not owned by you" },
        { status: 403 }
      );
    }

    // Process based on type
    if (type === "single") {
      const result = await payrollService.processDisbursement(
        payrolls[0].id,
        phoneNumber
      );
      
      return NextResponse.json({
        success: true,
        message: "Payout initiated successfully",
        referenceId: result.referenceId,
      });
    }

    if (type === "batch") {
      const results = await payrollService.processBatchDisbursement(
        payrolls.map((p) => p.id),
        phoneNumber
      );
      
      return NextResponse.json({
        success: true,
        message: `Processed ${results.successful.length} payouts`,
        results,
      });
    }

    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  } catch (error: any) {
    console.error("[PAYROLL_PROCESS]", error);
    return NextResponse.json(
      { error: error.message || "Internal error" },
      { status: 500 }
    );
  }
}