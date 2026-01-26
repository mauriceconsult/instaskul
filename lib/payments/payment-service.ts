// lib/payments/payment-service.ts

import { PaymentAdapter } from './adapters/base-adapter'
import { MobileMoneyAdapter } from './adapters/momo-adapter'
import { MPesaMockAdapter } from './adapters/mpesa-mock-adapter'
// Import real adapter when ready
// import { MPesaAdapter } from './adapters/mpesa-adapter'
import type { 
  PaymentRequest, 
  PaymentResponse, 
  PaymentVerification,
  PaymentNetwork,
  PaymentType,
} from '@/lib/types/payment.types'

export class PaymentService {
  private adapters: Map<string, PaymentAdapter> = new Map()

  constructor() {
    // Register adapters
    this.registerAdapter(new MobileMoneyAdapter())
    
    // Use mock M-Pesa for now
    const useMockMPesa = process.env.MPESA_USE_MOCK !== 'false'
    if (useMockMPesa) {
      console.log('[PAYMENT_SERVICE] Using Mock M-Pesa adapter')
      this.registerAdapter(new MPesaMockAdapter())
    }
    // When Daraja is ready, replace with:
    // else {
    //   this.registerAdapter(new MPesaAdapter())
    // }
  }

  private registerAdapter(adapter: PaymentAdapter) {
    adapter.supportedNetworks.forEach(network => {
      this.adapters.set(network, adapter)
    })
  }

  private getAdapter(network: PaymentNetwork): PaymentAdapter {
    const adapter = this.adapters.get(network)
    if (!adapter) {
      throw new Error(`No payment adapter found for network: ${network}`)
    }
    return adapter
  }

  /**
   * Initiate collection (student/customer pays)
   */
  async initiateCollection(
    amount: number | string,
    currency: 'UGX' | 'KES' | 'USD',
    phoneNumber: string,
    network: PaymentNetwork,
    reference: string,
    description?: string,
    metadata?: Record<string, any>
  ): Promise<PaymentResponse> {
    const adapter = this.getAdapter(network)

    const request: PaymentRequest = {
      type: 'COLLECTION',
      amount: {
        value: typeof amount === 'string' ? parseFloat(amount) : amount,
        currency,
      },
      phoneNumber,
      network,
      reference,
      description,
      metadata,
    }

    return adapter.initiateCollection(request)
  }

  /**
   * Initiate disbursement (payout to instructor/staff)
   */
  async initiateDisbursement(
    amount: number | string,
    currency: 'UGX' | 'KES' | 'USD',
    phoneNumber: string,
    network: PaymentNetwork,
    reference: string,
    description?: string,
    metadata?: Record<string, any>
  ): Promise<PaymentResponse> {
    const adapter = this.getAdapter(network)

    const request: PaymentRequest = {
      type: 'DISBURSEMENT',
      amount: {
        value: typeof amount === 'string' ? parseFloat(amount) : amount,
        currency,
      },
      phoneNumber,
      network,
      reference,
      description,
      metadata,
    }

    return adapter.initiateDisbursement(request)
  }

  /**
   * Verify payment status
   */
  async verifyPayment(
    reference: string,
    network: PaymentNetwork
  ): Promise<PaymentVerification> {
    const adapter = this.getAdapter(network)
    return adapter.verifyPayment(reference)
  }

  /**
   * Get supported networks
   */
  getSupportedNetworks(): PaymentNetwork[] {
    return Array.from(this.adapters.keys()) as PaymentNetwork[]
  }

  /**
   * Check if network is supported
   */
  isNetworkSupported(network: string): boolean {
    return this.adapters.has(network)
  }
}

// Export singleton instance
export const paymentService = new PaymentService()