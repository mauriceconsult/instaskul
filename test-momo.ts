import { config } from "dotenv";
config({ path: "./.env.local" });

import { momo } from "./lib/momo";

const payload = {
  amount: "1000",
  currency: "EUR", 
  externalId: "123456",
  payer: { partyIdType: "MSISDN" as const, partyId: "256777123457" }, // New test MSISDN
  payerMessage: "Payment for Instaskul",
  payeeNote: "Thank you",
};

async function testMoMo() {
  try {
    console.log("=== REQUEST TO PAY TEST ===");

    const referenceId = await momo.collections.requestToPay(payload);  

    console.log("Reference ID:", referenceId);

    await new Promise((r) => setTimeout(r, 5000));

    const status =
      await momo.collections.checkTransactionStatus(referenceId);

  //   const status =
  // await momo.collections.checkTransactionStatus(
  //   "4ed3540b-d494-4ab3-a0df-bd29346c8f6a"
  // );

    console.log(
      JSON.stringify(status, null, 2)
    );

  } catch (error) {
    console.error(error);
  }
}

testMoMo();
