import { config } from "dotenv";
config({ path: "./.env.local" });
import { momo } from "./lib/momo";

interface TransferPayload {
  amount: string;
  currency: string;
  externalId: string;
  payee: {
    partyIdType: "MSISDN";
    partyId: string;
  };
  payerMessage: string;
  payeeNote: string;
}

const TEST_CASE = process.argv[2] || "TC02-01";
const scenarios = {
  "TC02-01": {
    amount: "100",
    currency: "EUR",
    msisdn: "256774290781",
  },

  "TC02-03": {
    amount: "100",
    currency: "EUR",
    msisdn: "999999999999",
  },
  "TC02-04": {
  amount: "999999999",
  currency: "EUR",
  msisdn: "256774290781",
  },
"TC02-05": {
  amount: "100",
  currency: "EUR",
  msisdn: "999999999999",
  },
"TC02-06": {
  amount: "999999999999",
  currency: "EUR",
  msisdn: "256774290781",
},
};
const scenario =
  scenarios[TEST_CASE as keyof typeof scenarios];

if (!scenario) {
  throw new Error(`Unknown test case: ${TEST_CASE}`);
}


const payload: TransferPayload = {
  amount: scenario.amount,
  currency: scenario.currency,
  externalId: `${TEST_CASE}_${Date.now()}`,
payee: {
  partyIdType: "MSISDN",
  partyId: scenario.msisdn,
},
  payerMessage: "Instaskul Payroll Test",
  payeeNote: "Disbursement SIT Test",
};

(async () => {
  try {
    console.log(`=== ${TEST_CASE} ===`);
    const descriptions: Record<keyof typeof scenarios, string> = {
      "TC02-01": "VALID DISBURSEMENT",
      "TC02-03": "INVALID PAYEE",
      "TC02-04": "INVALID AMOUNT",
      "TC02-05": "INVALID AMOUNT & PAYEE",
      "TC02-06": "EXCESSIVE AMOUNT",
    };
    
    console.log(
      `=== ${TEST_CASE} ${descriptions[TEST_CASE as keyof typeof descriptions]} ===`
    );

    const transactionId =
      await momo.disbursements.transfer(payload);

    console.log("Transaction ID:", transactionId);

    await new Promise((r) => setTimeout(r, 15000));

    // const status =
    //   await momo.disbursements.getTransactionStatus(transactionId);

    let status;

for (let i = 0; i < 6; i++) {
  await new Promise((r) => setTimeout(r, 5000));

  try {
    status =
      await momo.disbursements.getTransactionStatus(transactionId);

    if (
      status.status === "SUCCESSFUL" ||
      status.status === "FAILED"
    ) {
      break;
    }
  } catch {}
}
  console.log(
  JSON.stringify(
    {
      tc: TEST_CASE,
      referenceId: transactionId,
      result: status,
    },
    null,
    2
  )
);

    console.log(JSON.stringify(status, null, 2));

  } catch (error: any) {
  console.error("=== ERROR ===");

  console.error(
    JSON.stringify(
      {
        status: error?.response?.status,
        data: error?.response?.data,
        message: error?.message,
      },
      null,
      2
    )
  );
}
})();


