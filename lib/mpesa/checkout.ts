import { prisma } from "@/lib/db";
import { getAbsoluteUrl } from "@/lib/url";
import { DarajaResponseError, getAccessToken, normalizeKePhone, stkPush } from "@/lib/mpesa/daraja";

export class MPesaCheckoutError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly transactionId?: string,
  ) {
    super(message);
    this.name = "MPesaCheckoutError";
  }
}

export async function initiateCourseMPesaPayment(
  userId: string,
  courseId: string,
  phoneNumber: string,
) {
  const phone = normalizeKePhone(phoneNumber);
  if (!phone) {
    throw new MPesaCheckoutError("Enter a valid Kenyan M-Pesa number", 400);
  }

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { id: true, title: true, amount: true, currency: true, isPublished: true },
  });
  if (!course) {
    throw new MPesaCheckoutError("Course not found", 404);
  }
  if (!course.isPublished) {
    throw new MPesaCheckoutError("Course is not available for enrollment", 400);
  }
  if (course.currency !== "KES") {
    throw new MPesaCheckoutError("Only courses priced in KES can be paid with M-Pesa", 400);
  }

  const amount = Number(course.amount);
  if (!Number.isSafeInteger(amount) || amount < 1) {
    throw new MPesaCheckoutError("Course price must be a whole-number KES amount", 400);
  }

  const enrollment = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId, courseId } },
    select: { id: true },
  });
  if (enrollment) {
    throw new MPesaCheckoutError("You are already enrolled in this course", 409);
  }

  const tuition = await prisma.tuition.findUnique({
    where: { userId_courseId: { userId, courseId } },
    select: { isPaid: true, momoStatus: true },
  });
  if (tuition?.isPaid) {
    throw new MPesaCheckoutError("This course has already been paid for", 409);
  }
  if (tuition?.momoStatus === "PENDING" || tuition?.momoStatus === "PROCESSING") {
    throw new MPesaCheckoutError("A payment for this course is already processing", 409);
  }

  const existingTransaction = await prisma.mPesaTransaction.findFirst({
    where: { userId, courseId, status: "PENDING" },
    orderBy: { createdAt: "desc" },
  });
  if (existingTransaction) {
    if (!existingTransaction.checkoutRequestId) {
      throw new MPesaCheckoutError("A payment request is already being prepared", 409);
    }
    return {
      transactionId: existingTransaction.id,
      checkoutRequestId: existingTransaction.checkoutRequestId,
      message: "An M-Pesa prompt is already pending. Check your phone.",
    };
  }

  const callbackToken = process.env.MPESA_CALLBACK_TOKEN?.trim();
  if (!callbackToken) {
    throw new MPesaCheckoutError("M-Pesa callback is not configured", 503);
  }

  const callbackUrl = process.env.MPESA_CALLBACK_URL?.trim()
    || getAbsoluteUrl(`/api/payments/ke/callback/${encodeURIComponent(callbackToken)}`);
  const expectedCallbackPath = `/api/payments/ke/callback/${encodeURIComponent(callbackToken)}`;
  let parsedCallbackUrl: URL;
  try {
    parsedCallbackUrl = new URL(callbackUrl);
  } catch {
    throw new MPesaCheckoutError("M-Pesa callback URL is invalid", 503);
  }
  if (
    (process.env.NODE_ENV === "production" && parsedCallbackUrl.protocol !== "https:")
    || parsedCallbackUrl.pathname !== expectedCallbackPath
  ) {
    throw new MPesaCheckoutError("M-Pesa callback URL must use the secured callback endpoint", 503);
  }

  try {
    await getAccessToken();
  } catch (error) {
    const reason = error instanceof Error ? error.message : "Daraja authentication failed";
    console.error("[MPESA_AUTH]", reason);
    throw new MPesaCheckoutError("Safaricom M-Pesa is temporarily unavailable", 503);
  }

  const transaction = await prisma.mPesaTransaction.create({
    data: {
      userId,
      courseId,
      phoneNumber: phone,
      amount: String(amount),
      currency: "KES",
      status: "PENDING",
    },
  });

  let acceptedRequest: { checkoutRequestId: string; merchantRequestId: string } | undefined;
  try {
    acceptedRequest = await stkPush({
      phone,
      amount,
      callbackUrl: parsedCallbackUrl.toString(),
      reference: `COURSE-${courseId}`,
      description: `Fee for ${course.title}`,
    });
    await prisma.mPesaTransaction.update({
      where: { id: transaction.id },
      data: {
        checkoutRequestId: acceptedRequest.checkoutRequestId,
        merchantRequestId: acceptedRequest.merchantRequestId,
      },
    });
    return {
      transactionId: transaction.id,
      checkoutRequestId: acceptedRequest.checkoutRequestId,
      message: "STK Push sent. Check your phone and enter your M-Pesa PIN.",
    };
  } catch (error) {
    const reason = error instanceof Error ? error.message : "Daraja STK Push failed";
    console.error("[MPESA_STK_PUSH]", reason);
    await prisma.mPesaTransaction.update({
      where: { id: transaction.id },
      data: {
        status: error instanceof DarajaResponseError ? "FAILED" : "PENDING",
        ...(acceptedRequest && {
          checkoutRequestId: acceptedRequest.checkoutRequestId,
          merchantRequestId: acceptedRequest.merchantRequestId,
        }),
        failureReason: reason.slice(0, 200),
      },
    });
    if (!(error instanceof DarajaResponseError)) {
      throw new MPesaCheckoutError(
        `Safaricom's response was inconclusive. Do not retry this payment; contact support with transaction ID ${transaction.id}.`,
        502,
        transaction.id,
      );
    }
    throw new MPesaCheckoutError("Safaricom could not start the payment. Please try again.", 502);
  }
}
