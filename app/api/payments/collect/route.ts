// app/api/payments/collect/route.ts
export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { paymentService } from '@/lib/payments/payment-service'
import type { PaymentNetwork } from '@/lib/types/payment.types'

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { 
      courseId, 
      amount, 
      currency, 
      phoneNumber, 
      network 
    } = await req.json()

    // Validation
    if (!courseId || !amount || !currency || !phoneNumber || !network) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if network is supported
    if (!paymentService.isNetworkSupported(network)) {
      return NextResponse.json(
        { error: `Payment network ${network} is not supported` },
        { status: 400 }
      )
    }

    // Generate unique reference
    const reference = `COL-${Date.now()}-${userId.slice(0, 8)}`

    // Create Tuition record
    const tuition = await prisma.tuition.create({
      data: {
        userId,
        courseId,
        amount: typeof amount === 'string' ? parseFloat(amount) : amount,
        currency,
        momoPhoneNumber: phoneNumber,
        momoNetwork: network,
        momoReferenceId: reference,
        momoStatus: 'PENDING',
      },
    })

    // Initiate payment
    const result = await paymentService.initiateCollection(
      amount,
      currency,
      phoneNumber,
      network as PaymentNetwork,
      reference,
      `Payment for course enrollment`,
      { courseId, userId, tuitionId: tuition.id }
    )

    // Update tuition with transaction ID
    await prisma.tuition.update({
      where: { id: tuition.id },
      data: {
        momoTransactionId: result.transactionId,
        momoStatus: result.status,
      },
    })

    return NextResponse.json({
      success: result.success,
      reference,
      transactionId: result.transactionId,
      status: result.status,
      message: result.message,
      checkoutRequestId: result.checkoutRequestId, // M-Pesa specific
    })
  } catch (error: any) {
    console.error('[PAYMENT_COLLECT]', error)
    return NextResponse.json(
      { error: error.message || 'Payment initiation failed' },
      { status: 500 }
    )
  }
}