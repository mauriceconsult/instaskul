// // lib/payments/mpesa-daraja.ts
// export const runtime = 'nodejs'

// import axios from 'axios'
// import { prisma } from '@/lib/prisma'
// import { getAbsoluteUrl } from '@/lib/url' // ADD THIS

// const DARAJA_BASE_URL = process.env.NODE_ENV === 'production'
//   ? 'https://api.safaricom.co.ke'
//   : 'https://sandbox.safaricom.co.ke'

// // ... rest of auth code ...

// export async function initiateStkPush({
//   userId,
//   courseId,
//   amount,
//   phoneNumber,
//   accountReference,
//   transactionDesc
// }: {
//   userId: string
//   courseId: string
//   amount: number
//   phoneNumber: string
//   accountReference?: string
//   transactionDesc?: string
// }) {
//   const txRef = `COL-${Date.now()}-${userId.slice(0, 8)}`

//   try {
//     // Create Tuition record
//     const tuition = await prisma.tuition.create({
//       data: {
//         userId,
//         courseId,
//         amount,
//         currency: 'KES',
//         momoPhoneNumber: phoneNumber,
//         momoReferenceId: txRef,
//         momoStatus: 'PENDING',
//         momoNetwork: 'MPESA'
//       }
//     })

//     const accessToken = await getAccessToken()

//     const timestamp = new Date()
//       .toISOString()
//       .replace(/[^0-9]/g, '')
//       .slice(0, 14)

//     const shortCode = process.env.MPESA_BUSINESS_SHORTCODE!
//     const passkey = process.env.MPESA_PASSKEY!
//     const password = Buffer.from(`${shortCode}${passkey}${timestamp}`).toString('base64')

//     const formattedPhone = phoneNumber.replace(/^\+/, '').replace(/^0/, '254')

//     const payload = {
//       BusinessShortCode: shortCode,
//       Password: password,
//       Timestamp: timestamp,
//       TransactionType: 'CustomerPayBillOnline',
//       Amount: Math.ceil(amount),
//       PartyA: formattedPhone,
//       PartyB: shortCode,
//       PhoneNumber: formattedPhone,
//       CallBackURL: getAbsoluteUrl('/api/payments/mpesa/callback'), // CHANGED
//       AccountReference: accountReference || txRef,
//       TransactionDesc: transactionDesc || 'InstaSkul Course Payment'
//     }

//     const response = await axios.post(
//       `${DARAJA_BASE_URL}/mpesa/stkpush/v1/processrequest`,
//       payload,
//       {
//         headers: {
//           Authorization: `Bearer ${accessToken}`,
//           'Content-Type': 'application/json'
//         }
//       }
//     )

//     await prisma.tuition.update({
//       where: { id: tuition.id },
//       data: {
//         momoTransactionId: response.data.CheckoutRequestID,
//         momoStatus: 'PROCESSING'
//       }
//     })

//     return {
//       success: true,
//       tuitionId: tuition.id,
//       txRef,
//       checkoutRequestId: response.data.CheckoutRequestID,
//       merchantRequestId: response.data.MerchantRequestID,
//       responseCode: response.data.ResponseCode,
//       responseDescription: response.data.ResponseDescription,
//       customerMessage: response.data.CustomerMessage,
//       message: 'Payment request sent to phone. Please check your phone and enter M-Pesa PIN.'
//     }
//   } catch (error: any) {
//     console.error('[MPESA_STK_PUSH_ERROR]', error.response?.data || error.message)
    
//     await prisma.tuition.updateMany({
//       where: { momoReferenceId: txRef },
//       data: { momoStatus: 'FAILED' }
//     })

//     throw new Error(
//       error.response?.data?.errorMessage || 
//       error.response?.data?.ResponseDescription ||
//       'M-Pesa payment initiation failed'
//     )
//   }
// }

// // ... rest of code, update other callback URLs similarly ...

// export async function initiateB2C({
//   adminId,
//   courseId,
//   amount,
//   phoneNumber,
//   reason,
//   occasion
// }: {
//   adminId: string
//   courseId: string
//   amount: number
//   phoneNumber: string
//   reason?: string
//   occasion?: 'SalaryPayment' | 'BusinessPayment' | 'PromotionPayment'
// }) {
//   const txRef = `DISB-${Date.now()}-${adminId.slice(0, 8)}`

//   try {
//     const payroll = await prisma.payroll.create({
//       data: {
//         adminId,
//         courseId,
//         amount,
//         currency: 'KES',
//         momoPhoneNumber: phoneNumber,
//         momoReferenceId: txRef,
//         momoStatus: 'PENDING',
//         momoNetwork: 'MPESA'
//       }
//     })

//     const accessToken = await getAccessToken()
//     const formattedPhone = phoneNumber.replace(/^\+/, '').replace(/^0/, '254')
//     const securityCredential = await generateSecurityCredential()

//     const payload = {
//       InitiatorName: process.env.MPESA_INITIATOR_NAME!,
//       SecurityCredential: securityCredential,
//       CommandID: occasion || 'BusinessPayment',
//       Amount: Math.ceil(amount),
//       PartyA: process.env.MPESA_BUSINESS_SHORTCODE!,
//       PartyB: formattedPhone,
//       Remarks: reason || 'InstaSkul payout',
//       QueueTimeOutURL: getAbsoluteUrl('/api/payments/mpesa/timeout'), // CHANGED
//       ResultURL: getAbsoluteUrl('/api/payments/mpesa/result'), // CHANGED
//       Occasion: reason || 'Payout'
//     }

//     const response = await axios.post(
//       `${DARAJA_BASE_URL}/mpesa/b2c/v1/paymentrequest`,
//       payload,
//       {
//         headers: {
//           Authorization: `Bearer ${accessToken}`,
//           'Content-Type': 'application/json'
//         }
//       }
//     )

//     await prisma.payroll.update({
//       where: { id: payroll.id },
//       data: {
//         momoTransactionId: response.data.ConversationID,
//         momoStatus: 'PROCESSING'
//       }
//     })

//     return {
//       success: true,
//       payrollId: payroll.id,
//       txRef,
//       conversationId: response.data.ConversationID,
//       originatorConversationId: response.data.OriginatorConversationID,
//       responseCode: response.data.ResponseCode,
//       responseDescription: response.data.ResponseDescription,
//       message: 'Disbursement initiated successfully'
//     }
//   } catch (error: any) {
//     console.error('[MPESA_B2C_ERROR]', error.response?.data || error.message)

//     await prisma.payroll.updateMany({
//       where: { momoReferenceId: txRef },
//       data: { momoStatus: 'FAILED' }
//     })

//     throw new Error(
//       error.response?.data?.errorMessage ||
//       'M-Pesa disbursement failed'
//     )
//   }
// }

// export async function registerC2BUrls() {
//   try {
//     const accessToken = await getAccessToken()

//     const payload = {
//       ShortCode: process.env.MPESA_BUSINESS_SHORTCODE!,
//       ResponseType: 'Completed',
//       ConfirmationURL: getAbsoluteUrl('/api/payments/mpesa/confirmation'), // CHANGED
//       ValidationURL: getAbsoluteUrl('/api/payments/mpesa/validation') // CHANGED
//     }

//     const response = await axios.post(
//       `${DARAJA_BASE_URL}/mpesa/c2b/v1/registerurl`,
//       payload,
//       {
//         headers: {
//           Authorization: `Bearer ${accessToken}`,
//           'Content-Type': 'application/json'
//         }
//       }
//     )

//     return {
//       success: true,
//       data: response.data
//     }
//   } catch (error: any) {
//     console.error('[MPESA_C2B_REGISTER_ERROR]', error.response?.data || error.message)
//     throw new Error('Failed to register C2B URLs')
//   }
// }

// export async function queryTransactionStatus(transactionId: string) {
//   try {
//     const accessToken = await getAccessToken()
//     const securityCredential = await generateSecurityCredential()

//     const payload = {
//       Initiator: process.env.MPESA_INITIATOR_NAME!,
//       SecurityCredential: securityCredential,
//       CommandID: 'TransactionStatusQuery',
//       TransactionID: transactionId,
//       PartyA: process.env.MPESA_BUSINESS_SHORTCODE!,
//       IdentifierType: '4',
//       ResultURL: getAbsoluteUrl('/api/payments/mpesa/status-result'), // CHANGED
//       QueueTimeOutURL: getAbsoluteUrl('/api/payments/mpesa/timeout'), // CHANGED
//       Remarks: 'Status query',
//       Occasion: 'Status'
//     }

//     const response = await axios.post(
//       `${DARAJA_BASE_URL}/mpesa/transactionstatus/v1/query`,
//       payload,
//       {
//         headers: {
//           Authorization: `Bearer ${accessToken}`,
//           'Content-Type': 'application/json'
//         }
//       }
//     )

//     return {
//       success: true,
//       data: response.data
//     }
//   } catch (error: any) {
//     console.error('[MPESA_STATUS_QUERY_ERROR]', error.response?.data || error.message)
//     throw new Error('Failed to query transaction status')
//   }
// }

// // ... rest of helper functions remain the same ...