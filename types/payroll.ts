// Shared types for both server and client

export interface PayrollStats {
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

export interface ClientPayroll {
  id: string;
  grossAmount: string;
  platformFee: string;
  transactionFee: string;
  netPayout: string;
  momoStatus: string;
  momoReferenceId?: string;
  createdAt: string;
  paidAt?: string;
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

export type PayrollStatus = "PENDING" | "PROCESSING" | "SUCCESSFUL" | "FAILED";

export interface PayrollCalculation {
  grossAmount: string;
  platformFee: string;
  transactionFee: string;
  netPayout: string;
}

// Additional types for batch processing
export interface BatchProcessResult {
  successful: string[];
  failed: Array<{
    id: string;
    error: string;
  }>;
}

// Type for disbursement result
export interface DisbursementResult {
  success: boolean;
  referenceId: string;
}

// Type for status check result
export interface StatusCheckResult {
  status: PayrollStatus;
  payroll: any; // Or a more specific type if needed
}