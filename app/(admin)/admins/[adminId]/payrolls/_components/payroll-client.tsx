"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  Clock,
  CheckCircle,
  TrendingUp,
  Wallet,
  RefreshCw,
  Phone,
} from "lucide-react";
import axios from "axios";

interface PayrollStats {
  totalEarnings: number;
  availableBalance: number;
  processingAmount: number;
  paidAmount: number;
  platformFeesTotal: number;
  transactionFeesTotal: number;
  totalTransactions: number;
  pendingCount: number;
  processingCount: number;
  successfulCount: number;
  failedCount: number;
}

// In PayrollClient component

interface Payroll {
  id: string;
  grossAmount: string;
  platformFee: string;
  transactionFee: string;
  netPayout: string;
  momoStatus: string;
  momoReferenceId?: string; // matches undefined from server
  createdAt: string; // ISO string
  paidAt?: string;   // ISO string or undefined
  course: {
    title: string;
    imageUrl?: string;
  };
  tuition: {
    isPaid: boolean;
    createdAt: string;
    amount?: string;
  };
}

interface PayrollClientProps {
  initialStats: PayrollStats;
  pendingPayrolls: Payroll[];
  historyPayrolls: Payroll[];
  adminId: string;
}

export default function PayrollClient({
  initialStats,
  pendingPayrolls: initialPending,
  historyPayrolls: initialHistory,
  adminId,
}: PayrollClientProps) {
  const { toast } = useToast();
  const [stats, setStats] = useState(initialStats);
  const [pendingPayrolls, setPendingPayrolls] = useState(initialPending);
  const [historyPayrolls, setHistoryPayrolls] = useState(initialHistory);
  const [selectedPayrolls, setSelectedPayrolls] = useState<string[]>([]);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [singlePayoutDialog, setSinglePayoutDialog] = useState<string | null>(null);

  const formatCurrency = (amount: number | string) => {
    const num = typeof amount === "string" ? parseFloat(amount) : amount;
    return new Intl.NumberFormat("en-UG", {
      style: "currency",
      currency: "UGX",
      minimumFractionDigits: 0,
    }).format(num);
  };

  const formatDate = (date: string | Date) => {
    return new Intl.DateTimeFormat("en-UG", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date));
  };

  const refreshData = async () => {
    try {
      setRefreshing(true);
      const [statsRes, pendingRes, historyRes] = await Promise.all([
        axios.get(`/api/admin/payroll?action=stats`),
        axios.get(`/api/admin/payroll?action=pending`),
        axios.get(`/api/admin/payroll?action=history&limit=20`),
      ]);

      setStats(statsRes.data);
      setPendingPayrolls(pendingRes.data);
      setHistoryPayrolls(historyRes.data);

      toast({
        title: "Data refreshed",
        description: "Payroll data updated successfully",
      });
    } catch (error) {
      console.error("Error refreshing data:", error);
      toast({
        title: "Failed to refresh",
        description: "Could not update payroll data",
        variant: "destructive",
      });
    } finally {
      setRefreshing(false);
    }
  };

  const handleSelectPayroll = (payrollId: string) => {
    setSelectedPayrolls((prev) =>
      prev.includes(payrollId)
        ? prev.filter((id) => id !== payrollId)
        : [...prev, payrollId]
    );
  };

  const handleSelectAll = () => {
    if (selectedPayrolls.length === pendingPayrolls.length) {
      setSelectedPayrolls([]);
    } else {
      setSelectedPayrolls(pendingPayrolls.map((p) => p.id));
    }
  };

  const validatePhoneNumber = (phone: string) => {
    // Uganda phone number format: +256XXXXXXXXX (total 13 chars)
    const ugandaRegex = /^\+256[0-9]{9}$/;
    return ugandaRegex.test(phone);
  };

  const handleProcessSingle = async (payrollId: string) => {
    if (!phoneNumber || !validatePhoneNumber(phoneNumber)) {
      toast({
        title: "Invalid phone number",
        description: "Please enter a valid Uganda phone number: +256XXXXXXXXX",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      await axios.post("/api/admin/payroll/process", {
        payrollIds: [payrollId],
        type: "single",
        phoneNumber,
      });

      toast({
        title: "Payout initiated!",
        description: "Check your phone for MoMo confirmation",
      });

      await refreshData();
      setSinglePayoutDialog(null);
      setPhoneNumber("");
    } catch (error: any) {
      console.error("Error processing payout:", error);
      toast({
        title: "Payout failed",
        description: error.response?.data?.error || "Failed to process payout",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleProcessBatch = async () => {
    if (selectedPayrolls.length === 0) {
      toast({
        title: "No payrolls selected",
        description: "Please select at least one payout to process",
        variant: "destructive",
      });
      return;
    }

    if (!phoneNumber || !validatePhoneNumber(phoneNumber)) {
      toast({
        title: "Invalid phone number",
        description: "Please enter a valid Uganda phone number: +256XXXXXXXXX",
        variant: "destructive",
      });
      return;
    }

    const totalAmount = selectedPayrolls.reduce((sum, id) => {
      const payroll = pendingPayrolls.find((p) => p.id === id);
      return sum + (payroll ? parseFloat(payroll.netPayout) : 0);
    }, 0);

    try {
      setLoading(true);
      const response = await axios.post("/api/admin/payroll/process", {
        payrollIds: selectedPayrolls,
        type: "batch",
        phoneNumber,
      });

      toast({
        title: "Batch payout initiated!",
        description: `Processing ${response.data.results.successful.length} payouts totaling ${formatCurrency(totalAmount)}`,
      });

      if (response.data.results.failed.length > 0) {
        toast({
          title: "Some payouts failed",
          description: `${response.data.results.failed.length} payouts could not be processed`,
          variant: "destructive",
        });
      }

      setSelectedPayrolls([]);
      await refreshData();
      setDialogOpen(false);
      setPhoneNumber("");
    } catch (error: any) {
      console.error("Error processing batch:", error);
      toast({
        title: "Batch payout failed",
        description: error.response?.data?.error || "Failed to process batch",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const config: Record<
      string,
      { variant: "default" | "secondary" | "destructive" | "outline"; label: string }
    > = {
      PENDING: { variant: "outline", label: "Pending" },
      PROCESSING: { variant: "secondary", label: "Processing" },
      SUCCESSFUL: { variant: "default", label: "Paid" },
      FAILED: { variant: "destructive", label: "Failed" },
    };

    const { variant, label } = config[status] || config.PENDING;
    return <Badge variant={variant}>{label}</Badge>;
  };

  const selectedTotal = selectedPayrolls.reduce((sum, id) => {
    const payroll = pendingPayrolls.find((p) => p.id === id);
    return sum + (payroll ? parseFloat(payroll.netPayout) : 0);
  }, 0);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Payroll Management</h1>
          <p className="text-muted-foreground">
            Manage your course earnings and payouts
          </p>
        </div>
        <Button
          variant="outline"
          onClick={refreshData}
          disabled={refreshing}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Available Balance
            </CardTitle>
            <Wallet className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(stats.availableBalance)}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.pendingCount} pending {stats.pendingCount === 1 ? "payout" : "payouts"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Processing</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(stats.processingAmount)}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.processingCount} in progress
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Paid</CardTitle>
            <CheckCircle className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">
              {formatCurrency(stats.paidAmount)}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.successfulCount} successful {stats.successfulCount === 1 ? "payout" : "payouts"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {formatCurrency(stats.totalEarnings)}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.totalTransactions} {stats.totalTransactions === 1 ? "transaction" : "transactions"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Fee Breakdown Card */}
      <Card>
        <CardHeader>
          <CardTitle>Fee Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Platform Fees (10%)</p>
              <p className="text-lg font-semibold">
                {formatCurrency(stats.platformFeesTotal)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Transaction Fees (2%)</p>
              <p className="text-lg font-semibold">
                {formatCurrency(stats.transactionFeesTotal)}
              </p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            Net payout = Gross amount - Platform fee (10%) - Transaction fee (2%)
          </p>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending">
            Pending ({stats.pendingCount})
          </TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        {/* Pending Tab */}
        <TabsContent value="pending" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Pending Payouts</CardTitle>
                  {selectedPayrolls.length > 0 && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {selectedPayrolls.length} selected • Total: {formatCurrency(selectedTotal)}
                    </p>
                  )}
                </div>
                {selectedPayrolls.length > 0 && (
                  <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Wallet className="h-4 w-4 mr-2" />
                        Process {selectedPayrolls.length} Selected
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Confirm Batch Payout</DialogTitle>
                        <DialogDescription>
                          You are about to process {selectedPayrolls.length}{" "}
                          {selectedPayrolls.length === 1 ? "payout" : "payouts"} totaling{" "}
                          <span className="font-semibold text-green-600">
                            {formatCurrency(selectedTotal)}
                          </span>
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="batch-phone">
                            <Phone className="h-4 w-4 inline mr-2" />
                            MoMo Phone Number
                          </Label>
                          <Input
                            id="batch-phone"
                            placeholder="+256771234567"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                          />
                          <p className="text-xs text-muted-foreground">
                            Enter your Uganda Mobile Money number (format: +256XXXXXXXXX)
                          </p>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setDialogOpen(false);
                            setPhoneNumber("");
                          }}
                          disabled={loading}
                        >
                          Cancel
                        </Button>
                        <Button onClick={handleProcessBatch} disabled={loading}>
                          {loading ? "Processing..." : "Confirm Payout"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {pendingPayrolls.length === 0 ? (
                <div className="text-center py-12">
                  <Wallet className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-lg font-medium">No pending payouts</p>
                  <p className="text-sm text-muted-foreground">
                    Payouts will appear here when students enroll in your courses
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox
                          checked={
                            selectedPayrolls.length === pendingPayrolls.length &&
                            pendingPayrolls.length > 0
                          }
                          onCheckedChange={handleSelectAll}
                        />
                      </TableHead>
                      <TableHead>Course</TableHead>
                      <TableHead>Gross Amount</TableHead>
                      <TableHead>Fees</TableHead>
                      <TableHead>Net Payout</TableHead>
                      <TableHead>Tuition Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingPayrolls.map((payroll) => (
                      <TableRow key={payroll.id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedPayrolls.includes(payroll.id)}
                            onCheckedChange={() => handleSelectPayroll(payroll.id)}
                          />
                        </TableCell>
                        <TableCell className="font-medium">
                          {payroll.course.title}
                        </TableCell>
                        <TableCell>
                          {formatCurrency(parseFloat(payroll.grossAmount))}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm space-y-1">
                            <div className="text-muted-foreground">
                              Platform: {formatCurrency(parseFloat(payroll.platformFee))}
                            </div>
                            <div className="text-muted-foreground">
                              Transaction: {formatCurrency(parseFloat(payroll.transactionFee))}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="font-semibold text-green-600">
                          {formatCurrency(parseFloat(payroll.netPayout))}
                        </TableCell>
                        <TableCell>
                          <Badge variant={payroll.tuition.isPaid ? "default" : "outline"}>
                            {payroll.tuition.isPaid ? "Paid" : "Unpaid"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          {formatDate(payroll.createdAt)}
                        </TableCell>
                        <TableCell>
                          <Dialog
                            open={singlePayoutDialog === payroll.id}
                            onOpenChange={(open) => {
                              setSinglePayoutDialog(open ? payroll.id : null);
                              if (!open) setPhoneNumber("");
                            }}
                          >
                            <DialogTrigger asChild>
                              <Button size="sm" variant="outline">
                                Process
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Confirm Payout</DialogTitle>
                                <DialogDescription>
                                  Process payout of{" "}
                                  <span className="font-semibold text-green-600">
                                    {formatCurrency(parseFloat(payroll.netPayout))}
                                  </span>{" "}
                                  for {payroll.course.title}
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                  <Label htmlFor={`phone-${payroll.id}`}>
                                    <Phone className="h-4 w-4 inline mr-2" />
                                    MoMo Phone Number
                                  </Label>
                                  <Input
                                    id={`phone-${payroll.id}`}
                                    placeholder="+256771234567"
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                  />
                                  <p className="text-xs text-muted-foreground">
                                    Enter your Uganda Mobile Money number
                                  </p>
                                </div>
                              </div>
                              <DialogFooter>
                                <Button
                                  variant="outline"
                                  onClick={() => {
                                    setSinglePayoutDialog(null);
                                    setPhoneNumber("");
                                  }}
                                  disabled={loading}
                                >
                                  Cancel
                                </Button>
                                <Button
                                  onClick={() => handleProcessSingle(payroll.id)}
                                  disabled={loading}
                                >
                                  {loading ? "Processing..." : "Confirm Payout"}
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Payout History</CardTitle>
            </CardHeader>
            <CardContent>
              {historyPayrolls.length === 0 ? (
                <div className="text-center py-12">
                  <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-lg font-medium">No payout history</p>
                  <p className="text-sm text-muted-foreground">
                    Processed payouts will appear here
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Course</TableHead>
                      <TableHead>Net Payout</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Reference ID</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Paid At</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {historyPayrolls.map((payroll) => (
                      <TableRow key={payroll.id}>
                        <TableCell className="font-medium">
                          {payroll.course.title}
                        </TableCell>
                        <TableCell className="font-semibold">
                          {formatCurrency(parseFloat(payroll.netPayout))}
                        </TableCell>
                        <TableCell>{getStatusBadge(payroll.momoStatus)}</TableCell>
                        <TableCell className="text-sm font-mono">
                          {payroll.momoReferenceId
                            ? `${payroll.momoReferenceId.slice(0, 8)}...`
                            : "-"}
                        </TableCell>
                        <TableCell className="text-sm">
                          {formatDate(payroll.createdAt)}
                        </TableCell>
                        <TableCell className="text-sm">
                          {payroll.paidAt ? formatDate(payroll.paidAt) : "-"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}