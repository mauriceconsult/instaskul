import "dotenv/config";
import { momo } from "./lib/momo";

const payload = {
  amount: "100",
  currency: "EUR",
  externalId: `test_${Date.now()}`,
  payee: {
    partyIdType: "MSISDN" as const,
    partyId: "256777123456",
  },
  payerMessage: "Instaskul Payroll Test",
  payeeNote: "Thank you for teaching!",
};

(async () => {
  console.log("=== SELF-SERVICE DISBURSEMENT TEST STARTED ===");

  try {
    console.log("Sending disbursement...");
    const transactionId = await momo.disbursements.transfer(payload);
    console.log("Transaction ID:", transactionId);

    console.log("Waiting 8 seconds for processing...");
    await new Promise((resolve) => setTimeout(resolve, 8000));

    const status = await momo.disbursements.getTransactionStatus(transactionId);
    console.log("Final Status:", status);

    if (status.status === "SUCCESSFUL") {
      console.log("DISBURSEMENT SUCCESSFUL — MONEY SENT!");
    } else {
      console.log("Status:", status.status);
    }
  } catch (error: any) {
    console.error("DISBURSEMENT FAILED");
    console.error(error?.response?.data || error.message || error);
  }
})();
