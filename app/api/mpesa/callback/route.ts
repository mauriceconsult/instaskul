// app/api/mpesa/callback/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

interface CallbackMetadata {
  Item: Array<{
    Name: string;
    Value: string | number;
  }>;
}

interface MPesaCallback {
  Body: {
    stkCallback: {
      MerchantRequestID: string;
      CheckoutRequestID: string;
      ResultCode: number;
      ResultDesc: string;
      CallbackMetadata?: CallbackMetadata;
    };
  };
}

export async function POST(req: Request) {
  try {
    const body: MPesaCallback = await req.json();
    const { stkCallback } = body.Body;

    console.log("[MPESA_CALLBACK]", JSON.stringify(stkCallback, null, 2));

    const transaction = await prisma.mPesaTransaction.findFirst({
      where: {
        checkoutRequestId: stkCallback.CheckoutRequestID,
      },
    });

    if (!transaction) {
      console.error("[MPESA_CALLBACK] Transaction not found");
      return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });
    }

    // ResultCode 0 means success
    if (stkCallback.ResultCode === 0) {
      // Extract metadata
      const metadata = stkCallback.CallbackMetadata?.Item || [];
      const mpesaReceiptNumber = metadata.find((item) => item.Name === "MpesaReceiptNumber")?.Value;
      const transactionDate = metadata.find((item) => item.Name === "TransactionDate")?.Value;
      const phoneNumber = metadata.find((item) => item.Name === "PhoneNumber")?.Value;

      // Update transaction
      await prisma.mPesaTransaction.update({
        where: { id: transaction.id },
        data: {
          status: "COMPLETED",
          mpesaReceiptNumber: mpesaReceiptNumber?.toString(),
          transactionDate: transactionDate?.toString(),
        },
      });

      // Create purchase record
      await prisma.tuition.create({
        data: {
          userId: transaction.userId,
          courseId: transaction.courseId,
        },
      });

      console.log("[MPESA_CALLBACK] Payment successful", mpesaReceiptNumber);
    } else {
      // Payment failed
      await prisma.mPesaTransaction.update({
        where: { id: transaction.id },
        data: {
          status: "FAILED",
          failureReason: stkCallback.ResultDesc,
        },
      });

      console.log("[MPESA_CALLBACK] Payment failed", stkCallback.ResultDesc);
    }

    // Always return success to M-Pesa
    return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });
  } catch (error) {
    console.error("[MPESA_CALLBACK]", error);
    // Still return success to M-Pesa to avoid retries
    return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });
  }
}
