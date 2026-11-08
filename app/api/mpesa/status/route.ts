// app/api/mpesa/status/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { reconcile } from "@/lib/mpesa/settle";

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

    let transaction = await prisma.mPesaTransaction.findFirst({
      where: { id: transactionId, userId },
    });

    if (!transaction) {
      return new NextResponse("Transaction not found", { status: 404 });
    }
    if (
      transaction.status === "PENDING"
      && transaction.checkoutRequestId
      && Date.now() - transaction.updatedAt.getTime() > 8_000
    ) {
      await reconcile(transaction.checkoutRequestId);
      transaction = await prisma.mPesaTransaction.findFirst({
        where: { id: transaction.id, userId },
      });
      if (!transaction) {
        return new NextResponse("Transaction not found", { status: 404 });
      }
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
