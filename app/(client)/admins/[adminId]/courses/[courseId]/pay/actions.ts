// D:\lms\app\(dashboard)\(routes)\courses\[courseId]\pay\actions.ts
"use server";

import { prisma } from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";
import { z } from "zod";

// MoMo API configuration
const momoConfig = {
  targetEnvironment:
    process.env.MOMO_TARGET_ENVIRONMENT ||
    "https://sandbox.momodeveloper.mtn.com",
  primaryKey:
    process.env.MOMO_PRIMARY_KEY || "17625f311b5d4e4ba6251bc76fb48781",
  userId: process.env.MOMOUSER_ID || "aff67f8a-94a6-408f-89df-000279f80d33",
  userSecret: process.env.MOMOUSER_SECRET || "5991f8404a174f3caf87912ddc488bce",
};

// Schema for MSISDN and enrollee validation
const paymentSchema = z.object({
  msisdn: z.string().length(12, "MSISDN must be 12 digits"),
  enrolleeUserId: z.string().optional(),
});

export async function processPayment(
  courseId: string,
  msisdn: string,
  enrolleeUserId?: string
) {
  let user: Awaited<ReturnType<typeof currentUser>> | null = null;
  let targetUserId: string | undefined = undefined;
  try {
    // Step 1: Authenticate payer
    user = await currentUser();
    if (!user || !user.id) {
      console.error("[PAYMENT_ERROR] Unauthorized payer");
      throw new Error("Unauthorized");
    }

    // Step 2: Validate input
    paymentSchema.parse({ msisdn, enrolleeUserId });

    // Step 3: Set enrollee (default to payer if not specified)
    targetUserId = enrolleeUserId || user.id;

    // Step 4: Check if enrollee is already enrolled
    const existingEnrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: targetUserId,
          courseId: courseId,
        },
      },
    });

    if (existingEnrollment) {
      console.error(
        `[PAYMENT_ERROR] User ${targetUserId} already enrolled in course ${courseId}`
      );
      throw new Error("User already enrolled in this course");
    }

    // Step 5: Validate course
    const course = await prisma.course.findUnique({
      where: { id: courseId, isPublished: true },
      select: {
        id: true,
        title: true,
        description: true,
        imageUrl: true,
        amount: true,
        adminId: true,
        userId: true,
        isPublished: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!course) {
      console.error(
        "[PAYMENT_ERROR] Course not found or not published:",
        courseId
      );
      throw new Error("Course not found or not published");
    }

    // Step 6: Process MoMo payment
    if (course.amount == null) {
      console.error(
        "[PAYMENT_ERROR] Course amount is null for course:",
        courseId
      );
      throw new Error("Course amount is not set");
    }
    console.log(
      `[PAYMENT_INIT] Processing payment by user ${user.id} for enrollee ${targetUserId}, course ${courseId}, MSISDN ${msisdn}`
    );
    const paymentResponse = await fetch(
      `${momoConfig.targetEnvironment}/collection/v1_0/requesttopay`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${momoConfig.userSecret}`,
          "X-Target-Environment": momoConfig.targetEnvironment,
          "Ocp-Apim-Subscription-Key": momoConfig.primaryKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: course.amount.toString(),
          currency: "UGX",
          externalId: `course_${courseId}_${targetUserId}_${Date.now()}`,
          payer: { partyIdType: "MSISDN", partyId: msisdn },
          payerMessage: `Payment for ${course.title} by ${user.id} for ${targetUserId}`,
          payeeNote: `InstaSkul course payment`,
        }),
      }
    );

    if (!paymentResponse.ok) {
      console.error(
        "[PAYMENT_ERROR] MoMo payment failed:",
        await paymentResponse.text()
      );
      throw new Error("Payment failed");
    }

    // Step 7: Create Tuition record
    const tuition = await prisma.tuition.create({
      data: {
        id: crypto.randomUUID(),
        userId: user.id, // Payer
        enrolleeUserId: targetUserId, // Enrollee
        courseId: courseId,
        amount: course.amount.toString(),
        status: "COMPLETED",
        partyId: msisdn,
        username: user.emailAddresses[0]?.emailAddress || "unknown",
        transactionId: `tx_${crypto.randomUUID()}`,
        isActive: true,
        isPaid: true,
        transId: `trans_${crypto.randomUUID()}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    // Step 8: Create Enrollment record for enrollee
    await prisma.enrollment.create({
      data: {
        id: crypto.randomUUID(),
        userId: targetUserId,
        courseId: courseId,
        tuitionId: tuition.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    // Step 9: Update UserProgress for enrollee
    await prisma.userProgress.upsert({
      where: {
        userId_courseId: {
          userId: targetUserId,
          courseId: courseId,
        },
      },
      update: {
        isEnrolled: true,
        updatedAt: new Date(),
      },
      create: {
        id: crypto.randomUUID(),
        userId: targetUserId,
        courseId: courseId,
        isEnrolled: true,
        isCompleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    console.log(
      `[ENROLLMENT_SUCCESS] User ${user.id} paid for enrollee ${targetUserId} in course ${courseId}, tuition ${tuition.id}`
    );

    // Step 10: Return success
    return {
      success: true,
      course: {
        id: course.id,
        title: course.title,
        description: course.description,
        imageUrl: course.imageUrl,
        amount: course.amount,
        adminId: course.adminId,
        userId: course.userId,
        isPublished: course.isPublished,
        createdAt: course.createdAt,
        updatedAt: course.updatedAt,
      },
    };
  } catch (error) {
    console.error(
      `[PAYMENT_ERROR] Failed for payer ${user?.id || "unknown"} enrolling ${
        targetUserId || "unknown"
      } on course ${courseId}`,
      error
    );
    return {
      success: false,
      error:
        typeof error === "object" && error !== null && "message" in error
          ? (error as { message: string }).message
          : String(error),
    };
  }
}
