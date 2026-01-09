export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { payrollService } from "@/lib/payroll";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
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

    const { searchParams } = new URL(req.url);
    const action = searchParams.get("action");

    switch (action) {
      case "stats":
        const stats = await payrollService.getPayrollStats(admin.id);
        return NextResponse.json(stats);

      case "pending":
        const pending = await payrollService.getPendingPayrolls(admin.id);
        return NextResponse.json(pending);

      case "history":
        const limit = parseInt(searchParams.get("limit") || "20");
        const history = await payrollService.getHistoryPayrolls(admin.id, limit);
        return NextResponse.json(history);

      default:
        const [allStats, allPending] = await Promise.all([
          payrollService.getPayrollStats(admin.id),
          payrollService.getPendingPayrolls(admin.id),
        ]);
        return NextResponse.json({ stats: allStats, pending: allPending });
    }
  } catch (error: any) {
    console.error("[PAYROLL_GET]", error);
    return NextResponse.json(
      { error: error.message || "Internal error" },
      { status: 500 }
    );
  }
}