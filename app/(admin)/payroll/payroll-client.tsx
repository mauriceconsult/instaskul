// app/(admin)/payroll/PayrollClient.tsx
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { momo } from "@/lib/momo";

interface Props {
  userId: string;
}

export default function PayrollClient({ userId }: Props) {
  const { toast } = useToast();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState(0);

  const loadBalance = async () => {
    setLoading(true);
    try {
      const bal = await momo.disbursements.getBalance(userId);
      setBalance(Number(bal.availableBalance) || 0);
      toast({ title: "Balance loaded", description: `Available: ${bal.availableBalance} ${bal.currency}` });
    } catch (error: any) {
      toast({ title: "Failed to load balance", description: error.message });
    }
    setLoading(false);
  };

  const requestPayout = async () => {
    if (!phoneNumber.startsWith("+256") || phoneNumber.length !== 13) {
      toast({ title: "Invalid phone", description: "Use format: +25677XXXXXX" });
      return;
    }

    setLoading(true);
    try {
      const txId = await momo.disbursements.selfServicePayout(
        userId,
        balance.toFixed(2),
        phoneNumber
      );
      toast({
        title: "Payout Requested!",
        description: `Transaction ID: ${txId}. Check your MoMo.`,
      });
      setPhoneNumber("");
      await loadBalance(); // Refresh
    } catch (error: any) {
      toast({
        title: "Payout Failed",
        description: error.message || "Unknown error",
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Self-Service Payroll</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <p className="text-lg">
              Available Balance: <strong className="text-2xl">{balance.toFixed(2)} EUR</strong>
            </p>
          </div>

          <Button onClick={loadBalance} disabled={loading} className="w-full">
            {loading ? "Loading..." : "Refresh Balance"}
          </Button>

          <div className="space-y-3">
            <Input
              placeholder="MoMo number: +256771234567"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              disabled={loading || balance <= 0}
            />
            <Button
              onClick={requestPayout}
              disabled={loading || balance <= 0 || !phoneNumber}
              className="w-full"
              size="lg"
            >
              {loading ? "Processing..." : `Disburse ${balance.toFixed(2)} EUR to MoMo`}
            </Button>
          </div>

          {balance === 0 && (
            <p className="text-sm text-muted-foreground text-center">
              No funds available for withdrawal yet.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}