// lib/payments/adapters/momo-adapter.ts

import { PaymentAdapter } from './base-adapter'
import type { 
  PaymentRequest, 
  PaymentResponse, 
  PaymentStatus, 
  PaymentVerification 
} from '@/lib/types/payment.types'

export class MobileMoneyAdapter extends PaymentAdapter {
  name = 'Mobile Money (Uganda)'
  supportedNetworks = ['MTN', 'AIRTEL']

  private apiKey: string
  private apiSecret: string
  private baseUrl: string

  constructor() {
    super()
    this.apiKey = process.env.MOMO_API_KEY || ''
    this.apiSecret = process.env.MOMO_SECRET || ''
    this.baseUrl = process.env.MOMO_BASE_URL || 'https://api.momo.ug'
  }

  protected formatPhoneNumber(phone: string, network: string): string {
    // Remove all non-digits
    let cleaned = phone.replace(/\D/g, '')
    
    // Add country code if missing
    if (!cleaned.startsWith('256')) {
      if (cleaned.startsWith('0')) {
        cleaned = '256' + cleaned.slice(1)
      } else {
        cleaned = '256' + cleaned
      }
    }
    
    return cleaned
  }

  async initiateCollection(request: PaymentRequest): Promise<PaymentResponse> {
    const amount = this.normalizeAmount(request.amount.value)
    const phone = this.formatPhoneNumber(request.phoneNumber, request.network)

    try {
      const response = await fetch(`${this.baseUrl}/collection/request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          amount: amount.toString(), // MoMo expects string
          currency: request.amount.currency,
          phoneNumber: phone,
          network: request.network,
          reference: request.reference,
          description: request.description,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Payment request failed')
      }

      return {
        success: true,
        transactionId: data.transactionId,
        reference: request.reference,
        status: 'PROCESSING',
        amount: { value: amount, currency: request.amount.currency },
        network: request.network,
        message: 'Payment request sent. Please check your phone.',
      }
    } catch (error: any) {
      return {
        success: false,
        transactionId: '',
        reference: request.reference,
        status: 'FAILED',
        amount: request.amount,
        network: request.network,
        message: error.message || 'Payment failed',
      }
    }
  }

  async initiateDisbursement(request: PaymentRequest): Promise<PaymentResponse> {
    const amount = this.normalizeAmount(request.amount.value)
    const phone = this.formatPhoneNumber(request.phoneNumber, request.network)

    try {
      const response = await fetch(`${this.baseUrl}/disbursement/request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          amount: amount.toString(),
          currency: request.amount.currency,
          phoneNumber: phone,
          network: request.network,
          reference: request.reference,
          description: request.description,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Disbursement failed')
      }

      return {
        success: true,
        transactionId: data.transactionId,
        reference: request.reference,
        status: 'PROCESSING',
        amount: { value: amount, currency: request.amount.currency },
        network: request.network,
        message: 'Disbursement initiated successfully',
      }
    } catch (error: any) {
      return {
        success: false,
        transactionId: '',
        reference: request.reference,
        status: 'FAILED',
        amount: request.amount,
        network: request.network,
        message: error.message || 'Disbursement failed',
      }
    }
  }

  async verifyPayment(reference: string): Promise<PaymentVerification> {
    try {
      const response = await fetch(`${this.baseUrl}/verify/${reference}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Verification failed')
      }

      const amount = this.normalizeAmount(data.amount)

      return {
        reference,
        status: data.status as PaymentStatus,
        transactionId: data.transactionId,
        receiptNumber: data.receiptNumber,
        amount: { value: amount, currency: data.currency },
        completedAt: data.completedAt ? new Date(data.completedAt) : undefined,
        failureReason: data.failureReason,
      }
    } catch (error: any) {
      return {
        reference,
        status: 'FAILED',
        failureReason: error.message,
      }
    }
  }
}