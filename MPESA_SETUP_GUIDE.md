# M-Pesa Daraja Integration Setup Guide

## Overview
This implementation replaces the old M-Pesa flow with Safaricom's Daraja API, adding multi-currency support (with M-Pesa supporting KES).

## Files Included

1. **course-amount-form.tsx** - Updated form with currency selector
2. **daraja.ts** - Core Daraja API utilities
3. **mpesa-initiate-route.ts** - API route to initiate payments
4. **mpesa-callback-route.ts** - Webhook for payment confirmations
5. **mpesa-status-route.ts** - Check payment status
6. **mpesa-checkout.tsx** - Frontend payment component
7. **schema-additions.prisma** - Database schema updates

## Setup Steps

### 1. Register for Daraja API
1. Visit https://developer.safaricom.co.ke/
2. Create an account
3. Create a new app (sandbox for testing)
4. Note your Consumer Key and Consumer Secret

### 2. Update Database Schema
Add the currency field to Course model and create MPesaTransaction model:

```bash
# Add the schema changes from schema-additions.prisma to your schema.prisma
# Then run:
npx prisma generate
npx prisma db push
```

### 3. Configure Environment Variables
Add to your `.env` file:

```env
MPESA_CONSUMER_KEY=your_consumer_key
MPESA_CONSUMER_SECRET=your_consumer_secret
MPESA_SHORTCODE=174379  # Sandbox shortcode, use yours in production
MPESA_PASSKEY=your_passkey
MPESA_CALLBACK_URL=https://yourdomain.com/api/mpesa/callback
MPESA_ENVIRONMENT=sandbox
```

### 4. Local Development Setup (Using ngrok)
For local testing, M-Pesa needs a public callback URL:

```bash
# Install ngrok
npm install -g ngrok

# Start your Next.js app
npm run dev

# In another terminal, expose port 3000
ngrok http 3000

# Copy the https URL and update .env
MPESA_CALLBACK_URL=https://abc123.ngrok.io/api/mpesa/callback
```

### 5. File Structure
Place files in your project:

```
lib/
  mpesa/
    daraja.ts

app/
  api/
    mpesa/
      initiate/
        route.ts
      callback/
        route.ts
      status/
        route.ts
    admins/
      [adminId]/
        courses/
          [courseId]/
            amounts/
              route.ts  (update to handle currency)

components/
  admin/
    course-amount-form.tsx
  mpesa-checkout.tsx
```

### 6. Update Amount API Route
Update your amounts route to handle currency:

```typescript
// app/api/admins/[adminId]/courses/[courseId]/amounts/route.ts
export async function PATCH(
  req: Request,
  { params }: { params: { adminId: string; courseId: string } }
) {
  try {
    const { userId } = auth();
    const { amount, currency } = await req.json();

    if (!userId || userId !== params.adminId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const course = await db.course.update({
      where: {
        id: params.courseId,
        userId: params.adminId,
      },
      data: {
        amount,
        currency: currency || "UGX",
      },
    });

    return NextResponse.json(course);
  } catch (error) {
    console.error("[COURSE_AMOUNT]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
```

### 7. Use MPesaCheckout Component
Replace your old payment button with:

```tsx
import { MPesaCheckout } from "@/components/mpesa-checkout";

// In your course page
<MPesaCheckout
  courseId={course.id}
  amount={course.amount}
  currency={course.currency}
  courseName={course.title}
/>
```

## Testing

### Sandbox Test Credentials
Use these Safaricom test numbers in sandbox:

```
Phone: 254708374149
Amount: Any amount between 1 and 70,000
PIN: Will be prompted on phone simulator
```

### Testing Flow
1. Click "Pay with M-Pesa"
2. Enter test phone number
3. Check console logs for STK push
4. Simulate payment on Safaricom's test portal
5. Watch callback logs
6. Verify purchase is created

## Currency Conversion (Future Enhancement)
For non-KES currencies, integrate a currency conversion API:

```typescript
// Example with exchangerate-api.com
async function convertCurrency(amount: number, from: string, to: string) {
  const response = await fetch(
    `https://api.exchangerate-api.com/v4/latest/${from}`
  );
  const data = await response.json();
  return amount * data.rates[to];
}
```

## Production Checklist
- [ ] Get production credentials from Safaricom
- [ ] Update MPESA_ENVIRONMENT to "production"
- [ ] Use production shortcode and passkey
- [ ] Set up proper callback URL (not ngrok)
- [ ] Test with small amounts first
- [ ] Implement proper error handling and logging
- [ ] Add email notifications for payments
- [ ] Set up monitoring for failed transactions
- [ ] Implement refund functionality if needed

## Security Notes
1. Never expose API credentials in client-side code
2. Validate all inputs on the server
3. Verify callback authenticity (consider IP whitelisting)
4. Log all transactions for audit trail
5. Implement rate limiting on payment endpoints

## Troubleshooting

### Common Issues

**"Invalid Access Token"**
- Check consumer key/secret are correct
- Ensure no extra spaces in .env file

**"Invalid Phone Number"**
- Must be 254XXXXXXXXX format
- Use formatPhoneNumber utility

**"Callback not received"**
- Ensure callback URL is publicly accessible
- Check ngrok is running for local dev
- Verify URL in Daraja portal matches .env

**"Transaction not found"**
- Database might not have been updated
- Check Prisma schema was pushed
- Verify transaction was created before STK push

## Support
For Daraja API issues: https://developer.safaricom.co.ke/documentation
For this integration: Check logs in `/api/mpesa/*` routes
