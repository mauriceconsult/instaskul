// lib/payments/adapters/mpesa-mock-adapter.ts

import { PaymentAdapter } from './base-adapter'
import type { 
  PaymentRequest, 
  PaymentResponse, 
  PaymentVerification 
} from '@/lib/types/payment.types'

/**
 * Mock M-Pesa adapter for development/testing
 * Will be replaced with real Daraja implementation
 */
export class MPesaMockAdapter extends PaymentAdapter {
  name = 'M-Pesa (Mock - Development Only)'
  supportedNetworks = ['MPESA']

  private mockDelay = 2000 // Simulate API delay

  protected formatPhoneNumber(phone: string, network: string): string {
    // M-Pesa format: 254XXXXXXXXX
    let cleaned = phone.replace(/\D/g, '')
    
    if (!cleaned.startsWith('254')) {
      if (cleaned.startsWith('0')) {
        cleaned = '254' + cleaned.slice(1)
      } else {
        cleaned = '254' + cleaned
      }
    }
    
    return cleaned
  }

  private async simulateApiCall<T>(data: T): Promise<T> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, this.mockDelay))
    return data
  }

  private generateMockCheckoutRequestId(): string {
    return `ws_CO_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private generateMockTransactionId(): string {
    return `MOCK${Date.now()}${Math.floor(Math.random() * 10000)}`
  }

  async initiateCollection(request: PaymentRequest): Promise<PaymentResponse> {
    const amount = this.normalizeAmount(request.amount.value)
    const phone = this.formatPhoneNumber(request.phoneNumber, request.network)

    console.log('[MPESA_MOCK] Initiating collection:', {
      amount,
      phone,
      reference: request.reference,
    })

    try {
      const checkoutRequestId = this.generateMockCheckoutRequestId()

      // Simulate STK Push request
      await this.simulateApiCall({ success: true })

      // Store mock transaction in memory for verification
      this.storeMockTransaction(request.reference, {
        checkoutRequestId,
        amount,
        phone,
        status: 'PROCESSING',
        type: 'COLLECTION',
      })

      return {
        success: true,
        transactionId: checkoutRequestId,
        reference: request.reference,
        status: 'PROCESSING',
        amount: { value: amount, currency: request.amount.currency },
        network: 'MPESA',
        checkoutRequestId,
        message: '[MOCK] STK Push sent. Check your phone.',
      }
    } catch (error: any) {
      return {
        success: false,
        transactionId: '',
        reference: request.reference,
        status: 'FAILED',
        amount: request.amount,
        network: 'MPESA',
        message: `[MOCK] ${error.message}`,
      }
    }
  }

  async initiateDisbursement(request: PaymentRequest): Promise<PaymentResponse> {
    const amount = this.normalizeAmount(request.amount.value)
    const phone = this.formatPhoneNumber(request.phoneNumber, request.network)

    console.log('[MPESA_MOCK] Initiating disbursement:', {
      amount,
      phone,
      reference: request.reference,
    })

    try {
      const conversationId = this.generateMockCheckoutRequestId()

      await this.simulateApiCall({ success: true })

      this.storeMockTransaction(request.reference, {
        conversationId,
        amount,
        phone,
        status: 'PROCESSING',
        type: 'DISBURSEMENT',
      })

      return {
        success: true,
        transactionId: conversationId,
        reference: request.reference,
        status: 'PROCESSING',
        amount: { value: amount, currency: request.amount.currency },
        network: 'MPESA',
        conversationId,
        message: '[MOCK] B2C payment initiated.',
      }
    } catch (error: any) {
      return {
        success: false,
        transactionId: '',
        reference: request.reference,
        status: 'FAILED',
        amount: request.amount,
        network: 'MPESA',
        message: `[MOCK] ${error.message}`,
      }
    }
  }

  async verifyPayment(reference: string): Promise<PaymentVerification> {
    console.log('[MPESA_MOCK] Verifying payment:', reference)

    await this.simulateApiCall({ success: true })

    const mockData = this.getMockTransaction(reference)

    if (!mockData) {
      return {
        reference,
        status: 'FAILED',
        failureReason: '[MOCK] Transaction not found',
      }
    }

    // Auto-complete after 5 seconds (simulate user entering PIN)
    const elapsed = Date.now() - mockData.createdAt
    const status = elapsed > 5000 ? 'COMPLETED' : 'PROCESSING'

    if (status === 'COMPLETED' && mockData.status !== 'COMPLETED') {
      // Update stored status
      this.storeMockTransaction(reference, {
        ...mockData,
        status: 'COMPLETED',
        receiptNumber: this.generateMockTransactionId(),
      })
    }

    return {
      reference,
      status,
      transactionId: mockData.checkoutRequestId || mockData.conversationId,
      receiptNumber: status === 'COMPLETED' ? mockData.receiptNumber : undefined,
      amount: { value: mockData.amount, currency: 'KES' },
      completedAt: status === 'COMPLETED' ? new Date() : undefined,
    }
  }

  // Mock transaction storage (in-memory)
  private mockTransactions: Map<string, any> = new Map()

  private storeMockTransaction(reference: string, data: any) {
    this.mockTransactions.set(reference, {
      ...data,
      createdAt: Date.now(),
    })
  }

  private getMockTransaction(reference: string) {
    return this.mockTransactions.get(reference)
  }
}