export interface CheckoutPaymentProvider {
  id: string;
  name: string;
  country: string;
  countryCode: string;
  currency: string;
  description: string;
  checkoutPath: string;
}

export const checkoutPaymentProviders: CheckoutPaymentProvider[] = [
  {
    id: "mtn-uganda",
    name: "MTN Mobile Money",
    country: "Uganda",
    countryCode: "UG",
    currency: "UGX",
    description: "Pay using an MTN MoMo number",
    checkoutPath: "momo",
  },
  {
    id: "safaricom-kenya",
    name: "Safaricom M-Pesa",
    country: "Kenya",
    countryCode: "KE",
    currency: "KES",
    description: "Pay using a Safaricom M-Pesa number",
    checkoutPath: "mpesa",
  },
];

export function getCheckoutPaymentProviders(currency: string) {
  return checkoutPaymentProviders.filter(
    (provider) => provider.currency === currency,
  );
}
