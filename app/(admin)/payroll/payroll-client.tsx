// app/(admin)/payroll/PayrollClient.tsx
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { momo } from "@/lib/momo";

interface PayrollClientProps {
  initialBalance: number;
  adminId: string;
}

export default function PayrollClient({ initialBalance, adminId }: PayrollClientProps) {
  const { toast } = useToast();
  const [balance, setBalance] = useState(initialBalance);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);

  const refreshBalance = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/payroll/balance?adminId=${adminId}`);
      const data = await response.json();
      setBalance(data.balance);
      toast({ title: "Balance refreshed" });
    } catch {
      toast({ title: "Failed to refresh balance", variant: "destructive" });
    }
    setLoading(false);
  };

  const requestPayout = async () => {
    if (!phoneNumber.match(/^\+256[0-9]{9}$/)) {
      toast({ title: "Invalid phone number", description: "Use +256 format", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const txId = await momo.disbursements.selfServicePayout(adminId, balance.toString(), phoneNumber);
      toast({ title: "Payout requested!", description: `Transaction ID: ${txId}` });
      setBalance(0);
      setPhoneNumber("");
    } catch (error: any) {
      toast({ title: "Payout failed", description: error.message, variant: "destructive" });
    }
    setLoading(false);
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Self-Service Payroll</h1>

      <Card>
        <CardHeader>
          <CardTitle>Available Earnings</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-4xl font-bold text-green-600 mb-4">
            UGX {balance.toLocaleString()}
          </p>
          <Button onClick={refreshBalance} disabled={loading} className="mb-6">
            Refresh Balance
          </Button>

          <div className="space-y-4">
            <Input
              placeholder="MoMo number (+256771234567)"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              disabled={loading || balance === 0}
            />
            <Button
              onClick={requestPayout}
              disabled={loading || balance === 0 || !phoneNumber}
              className="w-full"
              size="lg"
            >
              {loading ? "Processing..." : `Disburse UGX ${balance.toLocaleString()} to MoMo`}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}