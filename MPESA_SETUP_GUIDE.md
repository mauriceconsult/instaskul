# Safaricom M-Pesa (Daraja) Setup

The course checkout uses Safaricom Daraja STK Push in KES. The server reads the
course price from the database; a client-supplied amount is never used to charge
the learner. A successful Daraja status query/callback marks tuition paid and
creates the enrollment.

## Environment

Configure these server-side environment variables:

```env
MPESA_ENVIRONMENT=sandbox
MPESA_CONSUMER_KEY=...
MPESA_CONSUMER_SECRET=...
MPESA_SHORTCODE=174379
MPESA_PASSKEY=...
MPESA_CALLBACK_TOKEN=<long-random-url-safe-secret>
NEXT_PUBLIC_APP_URL=https://your-public-host
```

For production, set `MPESA_ENVIRONMENT=production` and use the matching
production shortcode, passkey, and credentials. The public callback URL must be
HTTPS. If `NEXT_PUBLIC_APP_URL` is not suitable for Safaricom, set
`MPESA_CALLBACK_URL` to the complete endpoint URL:

```text
https://your-public-host/api/payments/ke/callback/<MPESA_CALLBACK_TOKEN>
```

`MPESA_CALLBACK_URL` must use that exact callback path and token. Never expose
Daraja credentials or the callback token to client code.

For local development, expose the local app through an HTTPS tunnel, then set
`NEXT_PUBLIC_APP_URL` (or `MPESA_CALLBACK_URL`) to the tunnel URL. Use Safaricom
sandbox credentials and sandbox test numbers.

## Current flow

1. The authenticated learner requests checkout at `/api/mpesa/initiate` (the
   generic `/api/payments/collect` route delegates M-Pesa requests here too).
2. The server validates the published KES course, price, enrollment state, and
   Kenyan phone number, records a pending `MPesaTransaction`, then requests an
   STK Push.
3. Safaricom calls `/api/payments/ke/callback/<token>`. The callback is checked
   against Daraja's status query before any paid state is recorded.
4. The learner's status endpoint can also query Daraja if a callback is missed.
   On success, the transaction, tuition, and enrollment are updated atomically.

The checkout status endpoint is `/api/mpesa/status?transactionId=<id>`. The
generic verification endpoint also accepts the M-Pesa transaction ID as `ref`
with `network=MPESA`.

## Troubleshooting

- **Invalid access token:** Confirm the consumer key and secret match the
  selected sandbox/production environment.
- **STK request rejected:** Verify the shortcode, passkey, transaction type,
  phone number, and that the course is published and priced in whole KES.
- **Callback not accepted:** Check that the configured callback URL uses HTTPS
  in production, contains the exact callback token, and is publicly reachable.
- **Payment remains pending:** Check Daraja callback reachability and server
  logs for `[KE_CALLBACK]`, `[MPESA_STATUS]`, or `[MPESA_STK_PUSH]`.
