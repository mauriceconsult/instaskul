// app/api/mpesa/initiate/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { initiateSTKPush } from "@/lib/mpesa/daraja";
import { auth } from "@clerk/nextjs/server";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    const { courseId, phoneNumber, amount, currency } = await req.json();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Validate inputs
    if (!courseId || !phoneNumber || !amount) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Get course details
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: { admin: true },
    });

    if (!course) {
      return new NextResponse("Course not found", { status: 404 });
    }

    // Check if already tuitiond
    const tuition = await prisma.tuition.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
    });

    if (tuition) {
      return new NextResponse("Tuition already paid", { status: 400 });
    }

    // Convert currency if needed (only KES supported by M-Pesa)
    let finalAmount = parseFloat(amount);
    if (currency !== "KES") {
      // You would implement currency conversion here
      // For now, we'll just use the amount as-is
      // In production, use a currency conversion API
      return new NextResponse(
        "Only KES currency is supported for M-Pesa payments", 
        { status: 400 }
      );
    }

    // Create pending transaction record
    const transaction = await prisma.mPesaTransaction.create({
      data: {
        userId,
        courseId,
        phoneNumber,
        amount: finalAmount.toString(),
        currency: "KES",
        status: "PENDING",
      },
    });

    // Initiate STK Push
    const stkResponse = await initiateSTKPush({
      phoneNumber,
      amount: finalAmount,
      accountReference: `COURSE-${courseId}`,
      transactionDesc: `Payment for ${course.title}`,
    });

    // Update transaction with checkout request ID
    await prisma.mPesaTransaction.update({
      where: { id: transaction.id },
      data: {
        checkoutRequestId: stkResponse.CheckoutRequestID,
        merchantRequestId: stkResponse.MerchantRequestID,
      },
    });

    return NextResponse.json({
      success: true,
      message: stkResponse.CustomerMessage,
      transactionId: transaction.id,
      checkoutRequestId: stkResponse.CheckoutRequestID,
    });
  } catch (error) {
    console.error("[MPESA_INITIATE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
