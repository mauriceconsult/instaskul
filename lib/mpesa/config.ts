export const MPESA_ENV = process.env.MPESA_ENVIRONMENT === "production" ? "production" : "sandbox";
export const DARAJA_BASE =
  MPESA_ENV === "production" ? "https://api.safaricom.co.ke" : "https://sandbox.safaricom.co.ke";

export function mpesaConfig() {
  const c = {
    consumerKey: process.env.MPESA_CONSUMER_KEY,
    consumerSecret: process.env.MPESA_CONSUMER_SECRET,
    shortCode: process.env.MPESA_SHORTCODE,
    passkey: process.env.MPESA_PASSKEY,
  };
  const missing = Object.entries(c).filter(([, v]) => !v).map(([k]) => k);
  if (missing.length) throw new Error(`M-Pesa config missing: ${missing.join(", ")}`); // names only
  return c as Record<keyof typeof c, string>;
}