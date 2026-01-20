// lib/payment/get-payment-options.ts

import { prisma } from "../db";

export async function getPaymentOptions(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { market: true }
  });
  
  if (!user) {
    throw new Error(`User with id ${userId} not found`);
  }
  
  const methods = user.market.paymentMethods as string[];
  const currency = user.market.currency;
  const pricing = user.market.pricingConfig as any;
  
  // Return market-specific payment configuration
  return {
    methods: methods.map(method => ({
      id: method,
      name: getPaymentMethodName(method, currency),
      currency,
      pricing
    })),
    defaultMethod: methods[0]
  };
}

function getPaymentMethodName(method: string, currency: string): string {
  const names: Record<string, Record<string, string>> = {
    mpesa: { KES: 'M-Pesa', default: 'M-Pesa' },
    mobile_money: { UGX: 'Mobile Money', default: 'Mobile Money' },
    card: { default: 'Credit/Debit Card' },
    bank_transfer: { default: 'Bank Transfer' }
  };
  
  return names[method]?.[currency] || names[method]?.default || method;
}