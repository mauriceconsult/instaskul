import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { momo } from "@/lib/momo";
import { payrollService } from "@/lib/payroll";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const { userId } = await auth();
    const { courseId } = await params;
    const { msisdn, username, amount } = await req.json();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Validate inputs
    if (!msisdn || !amount) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Check if course exists and get admin/instructor ID
    const course = await prisma.course.findUnique({
      where: { id: courseId, isPublished: true },
      select: { 
        id: true, 
        amount: true, 
        title: true,
        userId: true, // Course creator/admin ID
      },
    });

    if (!course) {
      return new NextResponse("Course not found", { status: 404 });
    }

    // Ensure course has an owner
    if (!course.userId) {
      return new NextResponse("Course owner not found", { status: 400 });
    }

    // ✅ Store userId in a separate variable for type safety
    const courseOwnerId = course.userId;

    // Check if already enrolled
    const existingTuition = await prisma.tuition.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
    });

    if (existingTuition) {
      return new NextResponse("Already enrolled", { status: 400 });
    }

    // Initiate MoMo payment - ensure amount is string
    const payload = {
      amount: amount.toString(),
      currency: "UGX",
      externalId: `tuition_${courseId}_${userId}_${Date.now()}`,
      payer: {
        partyIdType: "MSISDN" as const,
        partyId: msisdn,
      },
      payerMessage: `Enrollment for ${course.title}`,
      payeeNote: username || "Course enrollment",
    };

    const referenceId = await momo.collections.requestToPay(payload);

    // Create pending tuition record
    const tuition = await prisma.tuition.create({
      data: {
        userId,
        courseId,
        amount: amount.toString(),
        username: username || null,
        partyId: msisdn,
        transactionId: referenceId,
        status: "PENDING",
        isPaid: false,
      },
    });

    // Poll for payment status (in production, use webhooks)
    setTimeout(async () => {
      try {
        const status = await momo.collections.checkTransactionStatus(referenceId);
        
        console.log(`[PAYMENT_STATUS] Reference: ${referenceId}, Status: ${status.status}`);

        if (status.status === "SUCCESSFUL") {
          // Update tuition to paid
          await prisma.tuition.update({
            where: { id: tuition.id },
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
              tuitionId: tuition.id,
            },
          });

          // ✅ Get admin record using the stored courseOwnerId
          const admin = await prisma.admin.findFirst({
            where: { 
              userId: courseOwnerId
            },
          });

          if (!admin) {
            console.error(`[PAYROLL_ERROR] Admin not found for user: ${courseOwnerId}`);
            console.log("✅ Payment successful - Enrollment created (Payroll skipped - Admin not found):", {
              tuitionId: tuition.id,
              enrollmentCreated: true,
              courseOwnerId,
            });
            return;
          }

          // Create payroll record
          const payroll = await payrollService.createPayrollRecord({
            tuitionId: tuition.id,
            userId,
            courseId,
            adminId: admin.id,
            tuitionAmount: amount.toString(), // Pass as string
          });

          console.log("✅ Payment successful - Enrollment and Payroll created:", {
            tuitionId: tuition.id,
            enrollmentCreated: true,
            payrollId: payroll.id,
            adminId: admin.id,
            netPayout: payroll.netPayout,
          });

        } else if (status.status === "FAILED") {
          // Update tuition to failed
          await prisma.tuition.update({
            where: { id: tuition.id },
            data: {
              status: "FAILED",
              isPaid: false,
            },
          });

          console.log("❌ Payment failed:", {
            tuitionId: tuition.id,
            referenceId,
          });
        }
      } catch (error) {
        console.error("[PAYMENT_STATUS_CHECK_ERROR]", error);
      }
    }, 30000); // Check after 30 seconds

    return NextResponse.json({
      success: true,
      referenceId,
      tuitionId: tuition.id,
      message: "Payment request sent. Please complete payment on your phone.",
    });

  } catch (error: any) {
    console.error("[CHECKOUT_POST]", error);
    return new NextResponse(error.message || "Internal error", { status: 500 });
  }
}

// Optional: Add a GET endpoint to check payment status manually
export async function GET(
  req: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const { userId } = await auth();
    const { searchParams } = new URL(req.url);
    const referenceId = searchParams.get("referenceId");

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!referenceId) {
      return new NextResponse("Reference ID required", { status: 400 });
    }

    // Check payment status
    const status = await momo.collections.checkTransactionStatus(referenceId);

    return NextResponse.json({
      status: status.status,
      referenceId,
      details: status,
    });

  } catch (error: any) {
    console.error("[CHECKOUT_STATUS_GET]", error);
    return new NextResponse(error.message || "Internal error", { status: 500 });
  }
}