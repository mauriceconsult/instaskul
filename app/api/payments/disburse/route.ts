// app/api/payments/disburse/route.ts
export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { paymentService } from '@/lib/payments/payment-service'
import type { PaymentNetwork } from '@/lib/types/payment.types'
import { payrollService } from '@/lib/payroll'

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
 const { grossAmount, platformFee, transactionFee, netPayout } =
  payrollService.calculatePayroll(grossAmountNum);

    // Create Payroll record
    if (!tuition.isPaid || tuition.momoStatus !== 'SUCCESSFUL') {
  return NextResponse.json(
    { error: 'Cannot disburse: tuition payment not confirmed' },
    { status: 400 }
  );
}

// Also guard against double disbursement
const existingPayroll = await prisma.payroll.findFirst({
  where: { tuitionId, momoStatus: { in: ['PENDING', 'PROCESSING', 'SUCCESSFUL'] } },
});
if (existingPayroll) {
  return NextResponse.json(
    { error: 'Disbursement already exists for this tuition' },
    { status: 409 }
  );
}
    const payroll = await prisma.payroll.create({
      data: {
        tuitionId,
        userId: instructorId,
        courseId: tuition.courseId,
        adminId: userId,
        instructorId,
        grossAmount,
        platformFee,
        transactionFee,
        netPayout,
        currency: currency || 'UGX',
        momoPhoneNumber: phoneNumber,
        momoNetwork: network,
        momoReferenceId: reference,
        momoStatus: 'PENDING',
      },
    })

    // Initiate disbursement
    const result = await paymentService.initiateDisbursement(
      parseFloat(netPayout),
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
      netPayout: parseFloat(netPayout),
    })
 } catch (error: unknown) {
  const message = error instanceof Error ? error.message : 'Payment failed';
  return NextResponse.json({ error: message }, { status: 500 });
}
}