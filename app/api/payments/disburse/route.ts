// app/api/payments/disburse/route.ts
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

    // Check if user is admin
    const adminIds = process.env.ADMIN_USER_IDS?.split(',') || []
    if (!adminIds.includes(userId)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { 
      tuitionId,
      amount, 
      currency, 
      phoneNumber, 
      network,
      description,
      instructorId
    } = await req.json()

    // Validation
    if (!tuitionId || !amount || !phoneNumber || !network || !instructorId) {
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

    // Get tuition record
    const tuition = await prisma.tuition.findUnique({
      where: { id: tuitionId },
      include: { course: true }
    })

    if (!tuition || !tuition.courseId) {
      return NextResponse.json(
        { error: 'Tuition record not found or missing courseId' },
        { status: 404 }
      )
    }

    // Generate unique reference
    const reference = `PAY-${Date.now()}-${instructorId.slice(0, 8)}`

    // Calculate fees
    const grossAmountNum = typeof amount === 'string' ? parseFloat(amount) : amount
    const platformFeeNum = grossAmountNum * 0.15 // 15% platform fee
    const transactionFeeNum = grossAmountNum * 0.02 // 2% transaction fee
    const netPayoutNum = grossAmountNum - platformFeeNum - transactionFeeNum

    // Create Payroll record
    const payroll = await prisma.payroll.create({
      data: {
        tuitionId,
        userId: instructorId,
        courseId: tuition.courseId,
        adminId: userId,
        instructorId,
        grossAmount: grossAmountNum.toString(),
        platformFee: platformFeeNum.toString(),
        transactionFee: transactionFeeNum.toString(),
        netPayout: netPayoutNum.toString(),
        currency: currency || 'UGX',
        momoPhoneNumber: phoneNumber,
        momoNetwork: network,
        momoReferenceId: reference,
        momoStatus: 'PENDING',
      },
    })

    // Initiate disbursement
    const result = await paymentService.initiateDisbursement(
      netPayoutNum,
      currency || 'UGX',
      phoneNumber,
      network as PaymentNetwork,
      reference,
      description || `Instructor payment for ${tuition.course?.title || 'course'}`,
      { instructorId, payrollId: payroll.id, initiatedBy: userId }
    )

    // Update payroll with transaction ID
    await prisma.payroll.update({
      where: { id: payroll.id },
      data: {
        momoTransactionId: result.transactionId,
        momoStatus: result.status,
        paidAt: result.status === 'COMPLETED' ? new Date() : null,
      },
    })

    return NextResponse.json({
      success: result.success,
      reference,
      transactionId: result.transactionId,
      status: result.status,
      message: result.message,
      conversationId: result.conversationId,
      netPayout: netPayoutNum,
    })
  } catch (error: any) {
    console.error('[PAYMENT_DISBURSE]', error)
    return NextResponse.json(
      { error: error.message || 'Disbursement failed' },
      { status: 500 }
    )
  }
}