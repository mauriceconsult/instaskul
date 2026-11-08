import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { initiateCourseMPesaPayment, MPesaCheckoutError } from "@/lib/mpesa/checkout";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }
    const { courseId, phoneNumber } = body as {
      courseId?: unknown;
      phoneNumber?: unknown;
    };
    if (typeof courseId !== "string" || typeof phoneNumber !== "string") {
      return NextResponse.json(
        { error: "Course ID and phone number are required" },
        { status: 400 },
      );
    }

    const payment = await initiateCourseMPesaPayment(userId, courseId, phoneNumber);
    return NextResponse.json({
      success: true,
      message: payment.message,
      transactionId: payment.transactionId,
      checkoutRequestId: payment.checkoutRequestId,
    });
  } catch (error) {
    if (error instanceof MPesaCheckoutError) {
      return NextResponse.json({
        error: error.message,
        transactionId: error.transactionId,
      }, { status: error.status });
    }
    console.error("[MPESA_INITIATE]", error);
    return NextResponse.json({ error: "M-Pesa payment initiation failed" }, { status: 500 });
  }
}
