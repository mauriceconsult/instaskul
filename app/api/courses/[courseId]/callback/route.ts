"use server";

import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest, context: any) {
  try {
    const { courseId } = (await context.params) as { courseId: string };
    const body = await req.json();
    const { userId, transactionId, status, amount } = body;

    if (!userId || !courseId || !transactionId || !status) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Create or update Tuition record
    const tuition = await prisma.tuition.upsert({
      where: {
        userId_courseId: { userId, courseId },
      },
      update: {
        status,
        isPaid: status === "SUCCESSFUL",
        transactionId,
        amount: amount ? String(amount) : "0.00",
        updatedAt: new Date(),
      },
      create: {
        id: crypto.randomUUID(),
        userId,
        courseId,
        transactionId,
        status,
        isPaid: status === "SUCCESSFUL",
        isActive: true,
        enrolleeUserId: userId,
        amount: amount ? String(amount) : "0.00",
        partyId: null,
        username: null,
        transId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    // Create or update Enrollment record
    await prisma.enrollment.upsert({
      where: {
        userId_courseId: { userId, courseId },
      },
      update: {},
      create: {
        userId,
        courseId,
        tuitionId: tuition.id,
      },
    });

    return new NextResponse("Payment processed successfully", { status: 200 });
  } catch (error) {
    console.error("[PAYMENT_CALLBACK_ERROR]", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
