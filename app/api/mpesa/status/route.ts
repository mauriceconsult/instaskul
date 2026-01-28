// app/api/mpesa/status/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";

export async function GET(req: Request) {
  try {
    const { userId } = await auth();
    const { searchParams } = new URL(req.url);
    const transactionId = searchParams.get("transactionId");

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!transactionId) {
      return new NextResponse("Transaction ID required", { status: 400 });
    }

    const transaction = await prisma.mPesaTransaction.findUnique({
      where: {
        id: transactionId,
        userId, // Ensure user owns this transaction
      },
    });

    if (!transaction) {
      return new NextResponse("Transaction not found", { status: 404 });
    }

    return NextResponse.json({
      status: transaction.status,
      mpesaReceiptNumber: transaction.mpesaReceiptNumber,
      failureReason: transaction.failureReason,
    });
  } catch (error) {
    console.error("[MPESA_STATUS]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
