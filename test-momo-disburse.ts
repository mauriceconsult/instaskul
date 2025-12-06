// test-momo-disburse.ts
import "dotenv/config";
import { momo } from "./lib/momo";

// Test payload (sandbox-friendly)
const payload = {
  amount: "100", // MTN sandbox only allows 100–5000 EUR
  currency: "EUR",
  externalId: `test_${Date.now()}`, // Must be unique every time
  payee: {
    partyIdType: "MSISDN" as const,
    partyId: "256777123456", // Official MTN sandbox test number
  },
  payerMessage: "Instaskul Payroll Test",
  payeeNote: "Thank you for teaching!",
};

(async () => {
  console.log("=== SELF-SERVICE DISBURSEMENT TEST STARTED ===");

  try {
    // Step 1: Initiate transfer
    console.log("Sending disbursement...");
    const transactionId = await momo.disbursements.client.transfer(payload);
    console.log("Transaction ID:", transactionId);

    // Step 2: Wait a bit
    console.log("Waiting 8 seconds for processing...");
    await new Promise((resolve) => setTimeout(resolve, 8000));

    // Step 3: Check status
    const status = await momo.disbursements.client.getTransaction(transactionId);
    console.log("Final Status:", status);

    if (status.status === "SUCCESSFUL") {
      console.log("DISBURSEMENT SUCCESSFUL — MONEY SENT!");
    } else {
      console.log("Status:", status.status);
    }
  } catch (error: any) {
    console.error("DISBURSEMENT FAILED");
    console.error("Error:", error?.response?.data || error.message || error);
  }
})();