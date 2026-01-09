"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatAmount } from "@/lib/format";
import axios from "axios";
import toast from "react-hot-toast";
import { Loader2, Smartphone } from "lucide-react";

interface MomoPaymentFormProps {
  course: {
    id: string;
    title: string;
    amount: string;
    admin: {
      title: string;
    } | null;
  };
}

export const MomoPaymentForm = ({ course }: MomoPaymentFormProps) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [msisdn, setMsisdn] = useState("");
  const [username, setUsername] = useState("");

  // Format phone number as user types
  const formatPhoneNumber = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, "");
    
    // Format as 256XXXXXXXXX
    if (digits.startsWith("256")) {
      return digits.slice(0, 12); // 256 + 9 digits
    } else if (digits.startsWith("0")) {
      return "256" + digits.slice(1, 10); // Convert 0XX to 256XX
    } else if (digits.length > 0) {
      return "256" + digits.slice(0, 9);
    }
    return digits;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setMsisdn(formatted);
  };

  const isValidPhone = msisdn.length === 12 && msisdn.startsWith("256");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isValidPhone) {
      toast.error("Please enter a valid phone number");
      return;
    }

    try {
      setIsLoading(true);

      const response = await axios.post(`/api/courses/${course.id}/checkout`, {
        msisdn,
        username: username || undefined,
        amount: course.amount,
      });

      if (response.data.success) {
        toast.success("Payment request sent! Please check your phone.");
        
        // Poll for payment status
        const checkPaymentStatus = setInterval(async () => {
          try {
            const statusResponse = await axios.get(
              `/api/courses/${course.id}/checkout/status?referenceId=${response.data.referenceId}`
            );

            if (statusResponse.data.status === "SUCCESSFUL") {
              clearInterval(checkPaymentStatus);
              toast.success("Payment successful! Redirecting...");
              router.push(`/courses/${course.id}`);
              router.refresh();
            } else if (statusResponse.data.status === "FAILED") {
              clearInterval(checkPaymentStatus);
              toast.error("Payment failed. Please try again.");
              setIsLoading(false);
            }
          } catch (error) {
            console.error("Status check error:", error);
          }
        }, 3000); // Check every 3 seconds

        // Stop checking after 2 minutes
        setTimeout(() => {
          clearInterval(checkPaymentStatus);
          setIsLoading(false);
        }, 120000);
      }
    } catch (error: any) {
      console.error("Payment error:", error);
      toast.error(error.response?.data?.error || "Payment failed. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="h-12 w-12 bg-yellow-400 rounded-lg flex items-center justify-center">
          <Smartphone className="h-6 w-6 text-slate-900" />
        </div>
        <div>
          <h2 className="text-xl font-bold">MTN Mobile Money</h2>
          <p className="text-sm text-slate-600">Enter your MoMo number</p>
        </div>
      </div>

      {/* Course Info */}
      <div className="bg-slate-50 rounded-lg p-4 mb-6">
        <p className="text-sm text-slate-600">You're enrolling in</p>
        <p className="font-semibold">{course.title}</p>
        <div className="flex items-center justify-between mt-3 pt-3 border-t">
          <span className="text-sm">Amount to pay</span>
          <span className="text-xl font-bold text-emerald-600">
            {formatAmount(course.amount)}
          </span>
        </div>
      </div>

      {/* Payment Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="msisdn">Phone Number *</Label>
          <Input
            id="msisdn"
            type="tel"
            placeholder="256XXXXXXXXX"
            value={msisdn}
            onChange={handlePhoneChange}
            disabled={isLoading}
            className="mt-1"
            maxLength={12}
          />
          <p className="text-xs text-slate-500 mt-1">
            Enter your MTN number (e.g., 256772123456)
          </p>
        </div>

        <div>
          <Label htmlFor="username">Name (Optional)</Label>
          <Input
            id="username"
            type="text"
            placeholder="Your name"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={isLoading}
            className="mt-1"
          />
          <p className="text-xs text-slate-500 mt-1">
            This helps us identify your payment
          </p>
        </div>

        <Button
          type="submit"
          disabled={!isValidPhone || isLoading}
          className="w-full bg-yellow-500 hover:bg-yellow-600 text-slate-900 font-semibold"
          size="lg"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing payment...
            </>
          ) : (
            `Pay ${formatAmount(course.amount)}`
          )}
        </Button>
      </form>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-900 font-medium mb-2">
          How to complete your payment:
        </p>
        <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
          <li>Click the "Pay" button above</li>
          <li>You'll receive a prompt on your phone</li>
          <li>Enter your MTN MoMo PIN to confirm</li>
          <li>Wait for confirmation</li>
        </ol>
      </div>
    </div>
  );
};