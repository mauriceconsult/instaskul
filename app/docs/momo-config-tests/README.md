# MTN MoMo Open API — SIT Test Suite
## `app/docs/momo-config-tests/`

Plain JavaScript. No TypeScript compiler, no Python, no shell scripts.

---

## Files

| File | Purpose |
|---|---|
| `momo-sit-runner.js` | Runs all 22 Collection test cases, writes `sit-results.json` |
| `fill-sit-sheet.js` | Reads `sit-results.json`, patches the SIT xlsx spreadsheet |
| `UG Momo OpenAPI SIT Sheet (2).xlsx` | MTN's official SIT sheet (never modified directly) |
| `UG_Momo_SIT_Filled.xlsx` | Output — generated after running fill-sit-sheet.js |

---

## Setup

```bash
# From this folder (or project root if package.json already has xlsx)
npm install xlsx uuid dotenv
```

Add to `.env.local`:
```env
MOMO_BASE_URL=https://sandbox.momodeveloper.mtn.com
MOMO_TARGET_ENV=sandbox
MOMO_SUBSCRIPTION_KEY=<your collection subscription key>
MOMO_API_USER=<uuid of your provisioned API user>
MOMO_API_KEY=<generated API key>
```

---

## Running

```bash
# Step 1 — run all test cases
node docs/momo-config-tests/momo-sit-runner.js

# Step 2 — write results into the spreadsheet
node fill-sit-sheet.js

# Or both at once
node momo-sit-runner.js && node fill-sit-sheet.js
```

Custom paths:
```bash
node fill-sit-sheet.js ./sit-results.json './UG Momo OpenAPI SIT Sheet (2).xlsx'
```

---

## How it works

### Positive test cases
TC01-03, TC01-04, TC02-01, TC02-02, TC02-03, TC02-06, TC02-08, TC02-12 use your
existing `momo` lib (`import { momo } from "./lib/momo.js"`) so the actual
production code path is exercised during SIT.

### Negative test cases
Cases that need deliberately corrupted headers (wrong subscription key, bad token,
missing currency, duplicate reference ID) use raw `fetch` directly to the MTN API.
The `momo` lib correctly rejects invalid input before it reaches the wire, so raw
fetch is the only way to verify the API's own error responses for those scenarios.

---

## Sandbox trigger MSISDNs

| MSISDN | Outcome |
|---|---|
| `256774290781` | SUCCESSFUL (payer approves) |
| `256774290782` | FAILED (payer rejects) |
| `256774290783` | TIMEOUT |
| `256774290784` | FAILED — limit reached |
| `256774290786` | FAILED — insufficient funds |

**Verify these against the MTN Developer Portal before running TC02-01 onward.**
They have changed between sandbox versions. If TC02-01/02/03 all return SUCCESSFUL,
the trigger MSISDNs may have been updated.

---

## Currency note

Sandbox: `EUR` (or `USD`) — hardcoded as `SANDBOX_CURRENCY` in the runner.
Production (Uganda): `UGX`. Change only in `.env.local` via a `MOMO_CURRENCY`
variable when you're ready to go live — do not touch the runner.

---

## momo lib method names

The runner assumes:
- `momo.auth.getToken()` → `{ access_token, token_type, expires_in }`
- `momo.collections.requestToPay(payload)` → `referenceId` (string)
- `momo.collections.checkTransactionStatus(referenceId)` → `{ status, ... }`

Adjust the method names at the top of `momo-sit-runner.js` if your lib differs.
