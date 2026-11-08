import { PaymentAdapter } from "./base-adapter";
import type { PaymentRequest, PaymentResponse, PaymentVerification } from "@/lib/types/payment.types";
import { stkPush, stkQuery, normalizeKePhone } from "@/lib/mpesa/daraja";
import { getAbsoluteUrl } from "@/lib/url";

export class MPesaDarajaAdapter extends PaymentAdapter {
  name = "M-Pesa (Daraja)";
  supportedNetworks = ["MPESA"];

  protected formatPhoneNumber(phone: string, _network: string): string {
    const p = normalizeKePhone(phone);
    if (!p) throw new Error("Enter a valid Kenyan M-Pesa number");
    return p;
  }

  async initiateCollection(request: PaymentRequest): Promise<PaymentResponse> {
    const fail = (message: string): PaymentResponse => ({
      success: false, transactionId: "", reference: request.reference,
      status: "FAILED", amount: request.amount, network: "MPESA", message,
    });
    if (request.amount.currency !== "KES") return fail("M-Pesa accepts KES only");

    try {
      const amount = this.normalizeAmount(request.amount.value);
      const phone = this.formatPhoneNumber(request.phoneNumber, request.network);
      const { checkoutRequestId } = await stkPush({
        phone, amount,
        callbackUrl: getAbsoluteUrl(`/api/payments/ke/callback/${process.env.MPESA_CALLBACK_TOKEN}`),
        reference: process.env.MPESA_ACCOUNT_REFERENCE ?? "Maxnovate", // shown to the customer, 12 characters max
        description: "Payment",
      });
      return {
        success: true, transactionId: checkoutRequestId, reference: request.reference,
        status: "PROCESSING", amount: { value: amount, currency: "KES" }, network: "MPESA",
        checkoutRequestId, message: "STK Push sent. Check your phone and enter your M-Pesa PIN.",
      };
    } catch (e: any) {
      return fail(e.message);
    }
  }

  async initiateDisbursement(): Promise<PaymentResponse> {
    throw new Error("M-Pesa payouts (B2C) are not enabled yet"); // never fake success on real money
  }

  // Daraja is queried by CheckoutRequestID, not by your own reference
  async verifyPayment(reference: string, transactionId?: string): Promise<PaymentVerification> {
    if (!transactionId) throw new Error("verifyPayment needs the CheckoutRequestID for M-Pesa");
    const q = await stkQuery(transactionId);
    if (q.state === "PENDING") return { reference, status: "PROCESSING", transactionId };
    if (q.state === "PAID") return { reference, status: "COMPLETED", transactionId, completedAt: new Date() };
    return { reference, status: "FAILED", transactionId, failureReason: q.reason };
  }
}