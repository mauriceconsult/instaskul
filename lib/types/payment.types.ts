// lib/types/payment.types.ts

export type PaymentNetwork = 'MTN' | 'AIRTEL' | 'MPESA' | 'CARD'
export type PaymentStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED'
export type PaymentType = 'COLLECTION' | 'DISBURSEMENT'

export interface PaymentAmount {
  value: number
  currency: 'UGX' | 'KES' | 'USD'
}

export interface PaymentRequest {
  type: PaymentType
  amount: PaymentAmount
  phoneNumber: string
  network: PaymentNetwork
  reference: string
  description?: string
  metadata?: Record<string, any>
}

export interface PaymentResponse {
  success: boolean
  transactionId: string
  reference: string
  status: PaymentStatus
  amount: PaymentAmount
  network: PaymentNetwork
  message?: string
  checkoutRequestId?: string // M-Pesa specific
  conversationId?: string // M-Pesa B2C specific
}

export interface PaymentVerification {
  reference: string
  status: PaymentStatus
  transactionId?: string
  receiptNumber?: string
  amount?: PaymentAmount
  completedAt?: Date
  failureReason?: string
}