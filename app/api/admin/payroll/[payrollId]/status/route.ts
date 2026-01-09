import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { payrollService } from "@/lib/payroll";
import { prisma } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: { payrollId: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get admin record
    const admin = await prisma.admin.findFirst({
      where: { userId },
    });

    if (!admin) {
      return NextResponse.json({ error: "Admin not found" }, { status: 404 });
    }

    // Verify ownership
    const payroll = await prisma.payroll.findFirst({
      where: {
        id: params.payrollId,
        adminId: admin.id,
      },
    });

    if (!payroll) {
      return NextResponse.json(
        { error: "Payroll not found or unauthorized" },
        { status: 404 }
      );
    }

    const status = await payrollService.checkDisbursementStatus(params.payrollId);
    
    return NextResponse.json(status);
  } catch (error: any) {
    console.error("[PAYROLL_STATUS_GET]", error);
    return NextResponse.json(
      { error: error.message || "Internal error" },
      { status: 500 }
    );
  }
}
