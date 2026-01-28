// components/mpesa-checkout.tsx
"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, CheckCircle2, XCircle, Phone } from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

interface MPesaCheckoutProps {
  courseId: string;
  amount: string;
  currency: string;
  courseName: string;
}

type PaymentStatus = "idle" | "pending" | "success" | "failed";

export function MPesaCheckout({
  courseId,
  amount,
  currency,
  courseName,
}: MPesaCheckoutProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>("idle");
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup polling interval on unmount
  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, []);

  // Format phone number as user types
  const formatPhoneInput = useCallback((value: string) => {
    // Remove all non-digit characters
    const digits = value.replace(/\D/g, "");
    
    // Handle different formats
    if (digits.startsWith("254")) {
      return digits.slice(0, 12); // 254XXXXXXXXX (12 digits)
    } else if (digits.startsWith("0")) {
      return digits.slice(0, 10); // 0XXXXXXXXX (10 digits)
    }
    return digits.slice(0, 9); // XXXXXXXXX (9 digits)
  }, []);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneInput(e.target.value);
    setPhoneNumber(formatted);
  };

  const validatePhoneNumber = useCallback((phone: string): boolean => {
    // Remove spaces
    const cleaned = phone.replace(/\s/g, "");
    
    // Valid formats:
    // 254XXXXXXXXX (12 digits, starts with 254)
    // 0XXXXXXXXX (10 digits, starts with 0)
    // XXXXXXXXX (9 digits)
    const phoneRegex = /^(?:254[71]\d{8}|0[71]\d{8}|[71]\d{8})$/;
    
    return phoneRegex.test(cleaned);
  }, []);

  const pollPaymentStatus = useCallback(async (txnId: string) => {
    const maxAttempts = 30; // 5 minutes total (30 * 10 seconds)
    let attempts = 0;

    pollIntervalRef.current = setInterval(async () => {
      attempts++;

      try {
        const response = await axios.get(`/api/mpesa/status?transactionId=${txnId}`);
        const { status, failureReason } = response.data;

        if (status === "COMPLETED") {
          if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
          }
          setPaymentStatus("success");
          setIsProcessing(false);
          toast.success("Payment successful!");
          
          // Redirect after showing success message
          setTimeout(() => {
            router.push(`/courses/${courseId}`);
            router.refresh();
          }, 2000);
        } else if (status === "FAILED") {
          if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
          }
          setPaymentStatus("failed");
          setIsProcessing(false);
          toast.error(failureReason || "Payment failed. Please try again.");
        } else if (attempts >= maxAttempts) {
          if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
          }
          setPaymentStatus("failed");
          setIsProcessing(false);
          toast.error("Payment timed out. If money was deducted, please contact support.");
        }
      } catch (error) {
        console.error("Status check error:", error);
        if (attempts >= maxAttempts) {
          if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
          }
          setPaymentStatus("failed");
          setIsProcessing(false);
          toast.error("Unable to verify payment status. Please contact support.");
        }
      }
    }, 10000); // Check every 10 seconds
  }, [courseId, router]);

  const handlePayment = async () => {
    // Validation
    if (!phoneNumber.trim()) {
      toast.error("Please enter your phone number");
      return;
    }

    if (!validatePhoneNumber(phoneNumber)) {
      toast.error("Please enter a valid Kenyan phone number (e.g., 0712345678)");
      return;
    }

    if (currency !== "KES") {
      toast.error("M-Pesa only supports KES currency. Please contact support.");
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Invalid amount");
      return;
    }

    setIsProcessing(true);
    setPaymentStatus("pending");

    try {
      const response = await axios.post("/api/mpesa/initiate", {
        courseId,
        phoneNumber,
        amount,
        currency,
      });

      setTransactionId(response.data.transactionId);
      toast.success(response.data.message || "Check your phone for the M-Pesa prompt");

      // Start polling for payment status
      pollPaymentStatus(response.data.transactionId);
    } catch (error: any) {
      console.error("Payment error:", error);
      
      const errorMessage = 
        error.response?.data?.message || 
        error.response?.data || 
        "Payment initiation failed. Please try again.";
      
      toast.error(errorMessage);
      setPaymentStatus("failed");
      setIsProcessing(false);
    }
  };

  const resetDialog = () => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
    }
    setIsOpen(false);
    setPhoneNumber("");
    setPaymentStatus("idle");
    setTransactionId(null);
    setIsProcessing(false);
  };

  const getStatusMessage = () => {
    switch (paymentStatus) {
      case "pending":
        return {
          icon: <Loader2 className="h-5 w-5 animate-spin text-blue-600" />,
          bgColor: "bg-blue-50",
          title: "Payment in progress",
          description: "Check your phone for the M-Pesa prompt and enter your PIN",
          titleColor: "text-blue-900",
          descColor: "text-blue-700",
        };
      case "success":
        return {
          icon: <CheckCircle2 className="h-5 w-5 text-green-600" />,
          bgColor: "bg-green-50",
          title: "Payment successful!",
          description: "Redirecting to your course...",
          titleColor: "text-green-900",
          descColor: "text-green-700",
        };
      case "failed":
        return {
          icon: <XCircle className="h-5 w-5 text-red-600" />,
          bgColor: "bg-red-50",
          title: "Payment failed",
          description: "Please try again or contact support if money was deducted",
          titleColor: "text-red-900",
          descColor: "text-red-700",
        };
      default:
        return null;
    }
  };

  const statusInfo = getStatusMessage();

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="w-full md:w-auto"
        size="lg"
      >
        <Phone className="mr-2 h-4 w-4" />
        Pay with M-Pesa
      </Button>

      <Dialog open={isOpen} onOpenChange={(open) => !isProcessing && setIsOpen(open)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>M-Pesa Payment</DialogTitle>
            <DialogDescription>
              Complete your payment for {courseName}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                value={`${currency} ${parseFloat(amount).toLocaleString()}`}
                disabled
                className="bg-muted font-semibold"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">M-Pesa Phone Number</Label>
              <Input
                id="phone"
                placeholder="0712345678"
                value={phoneNumber}
                onChange={handlePhoneChange}
                disabled={isProcessing}
                maxLength={12}
                type="tel"
              />
              <p className="text-xs text-muted-foreground">
                Enter your Safaricom M-Pesa number
              </p>
            </div>

            {statusInfo && (
              <div className={`flex items-start gap-3 p-4 rounded-lg ${statusInfo.bgColor}`}>
                <div className="flex-shrink-0 mt-0.5">
                  {statusInfo.icon}
                </div>
                <div className="flex-1 text-sm">
                  <p className={`font-medium ${statusInfo.titleColor}`}>
                    {statusInfo.title}
                  </p>
                  <p className={statusInfo.descColor}>
                    {statusInfo.description}
                  </p>
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <Button
                onClick={handlePayment}
                disabled={isProcessing || paymentStatus === "success"}
                className="flex-1"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Pay Now"
                )}
              </Button>

              {!isProcessing && paymentStatus !== "success" && (
                <Button
                  onClick={resetDialog}
                  variant="outline"
                  type="button"
                >
                  Cancel
                </Button>
              )}
            </div>

            {transactionId && (
              <p className="text-xs text-muted-foreground text-center">
                Transaction ID: {transactionId.slice(0, 8)}...
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
