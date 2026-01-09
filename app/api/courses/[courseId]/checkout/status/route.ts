import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { momo } from "@/lib/momo";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const { userId } = await auth();
    const { courseId } = await params;
    const { searchParams } = new URL(req.url);
    const referenceId = searchParams.get("referenceId");

    if (!userId || !referenceId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Check MoMo transaction status
    const momoStatus = await momo.collections.checkTransactionStatus(referenceId);

    // Update tuition record
    if (momoStatus.status === "SUCCESSFUL") {
      await prisma.tuition.update({
        where: {
          userId_courseId: {
            userId,
            courseId,
          },
        },
        data: {
          isPaid: true,
          status: "SUCCESSFUL",
        },
      });

      // Create enrollment
      await prisma.enrollment.create({
        data: {
          userId,
          courseId,
          tuitionId: (await prisma.tuition.findUnique({
            where: { userId_courseId: { userId, courseId } },
            select: { id: true },
          }))!.id,
        },
      });
    }

    return NextResponse.json({
      status: momoStatus.status,
      financialTransactionId: momoStatus.financialTransactionId,
    });
  } catch (error: any) {
    console.error("[CHECKOUT_STATUS]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}