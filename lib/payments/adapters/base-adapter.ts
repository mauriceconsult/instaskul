// lib/payments/adapters/base-adapter.ts

import type { 
  PaymentRequest, 
  PaymentResponse, 
  PaymentVerification 
} from '@/lib/types/payment.types'

export abstract class PaymentAdapter {
  abstract name: string
  abstract supportedNetworks: string[]

  /**
   * Normalize amount to number (handle both string and number inputs)
   */
  protected normalizeAmount(amount: string | number): number {
    if (typeof amount === 'string') {
      return parseFloat(amount.replace(/,/g, ''))
    }
    return amount
  }

  /**
   * Format phone number for specific gateway
   */
  protected abstract formatPhoneNumber(phone: string, network: string): string

  /**
   * Initiate collection (customer pays merchant)
   */
  abstract initiateCollection(request: PaymentRequest): Promise<PaymentResponse>

  /**
   * Initiate disbursement (merchant pays customer)
   */
  abstract initiateDisbursement(request: PaymentRequest): Promise<PaymentResponse>

  /**
   * Verify payment status
   */
  abstract verifyPayment(reference: string): Promise<PaymentVerification>

  /**
   * Check if network is supported
   */
  isNetworkSupported(network: string): boolean {
    return this.supportedNetworks.includes(network)
  }
}