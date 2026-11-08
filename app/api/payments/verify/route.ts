// app/api/payments/verify/route.ts
export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/db'
import { paymentService } from '@/lib/payments/payment-service'
import { reconcile } from '@/lib/mpesa/settle'

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const reference = searchParams.get('ref')
    const network = searchParams.get('network')

    if (!reference || !network) {
      return NextResponse.json(
        { error: 'Reference and network required' },
        { status: 400 }
      )
    }

    if (network === 'MPESA') {
      const { userId } = await auth()
      if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }

      let transaction = await prisma.mPesaTransaction.findFirst({
        where: {
          userId,
          OR: [{ id: reference }, { checkoutRequestId: reference }],
        },
      })
      if (!transaction) {
        return NextResponse.json({ error: 'Transaction not found' }, { status: 404 })
      }

      if (transaction.status === 'PENDING' && transaction.checkoutRequestId) {
        await reconcile(transaction.checkoutRequestId)
        transaction = await prisma.mPesaTransaction.findFirst({
          where: { id: transaction.id, userId },
        })
        if (!transaction) {
          return NextResponse.json({ error: 'Transaction not found' }, { status: 404 })
        }
      }

      const status = transaction.status === 'COMPLETED'
        ? 'COMPLETED'
        : transaction.status === 'FAILED'
          ? 'FAILED'
          : 'PROCESSING'
      return NextResponse.json({
        reference,
        status,
        transactionId: transaction.checkoutRequestId ?? transaction.id,
        receiptNumber: transaction.mpesaReceiptNumber ?? undefined,
        amount: { value: Number(transaction.amount), currency: transaction.currency },
        failureReason: transaction.failureReason ?? undefined,
        completedAt: status === 'COMPLETED' ? transaction.updatedAt : undefined,
      })
    }

    // Verify payment
    const verification = await paymentService.verifyPayment(
      reference,
      network as any
    )

    // Update database based on type
    if (reference.startsWith('COL-')) {
      // Collection - update Tuition
      const tuition = await prisma.tuition.findFirst({
        where: { 
          OR: [
            { momoReferenceId: reference },
            { transactionId: reference }
          ]
        },
      })

      if (tuition) {
        await prisma.tuition.update({
          where: { id: tuition.id },
          data: {
            momoStatus: verification.status,
            momoTransactionId: verification.receiptNumber || verification.transactionId || null,
            isPaid: verification.status === 'COMPLETED',
            status: verification.status,
          },
        })

        // If completed, create enrollment
        if (verification.status === 'COMPLETED' && tuition.courseId) {
          const existingEnrollment = await prisma.enrollment.findUnique({
            where: {
              userId_courseId: {
                userId: tuition.userId,
                courseId: tuition.courseId,
              },
            },
          })

          if (!existingEnrollment) {
            await prisma.enrollment.create({
              data: {
                userId: tuition.userId,
                courseId: tuition.courseId,
                tuitionId: tuition.id,
                // REMOVED: status: 'ACTIVE' - field doesn't exist
              },
            })
          }
        }
      }
    } else if (reference.startsWith('PAY-')) {
      // Disbursement - update Payroll
      const payroll = await prisma.payroll.findUnique({
        where: { momoReferenceId: reference },
      })

      if (payroll) {
        await prisma.payroll.update({
          where: { id: payroll.id },
          data: {
            momoTransactionId: verification.receiptNumber || verification.transactionId || null,
            momoStatus: verification.status,
            paidAt: verification.status === 'COMPLETED' ? new Date() : null,
          },
        })
      }
    }

    return NextResponse.json(verification)
  } catch (error: any) {
    console.error('[PAYMENT_VERIFY]', error)
    return NextResponse.json(
      { error: error.message || 'Verification failed' },
      { status: 500 }
    )
  }
}