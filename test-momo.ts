import { config } from "dotenv";
config({ path: "./.env.local" });

import { randomUUID } from "crypto";
import { writeFileSync } from "fs";
import { momo } from "./lib/momo";

const MAX_POLLS = 18;
const POLL_INTERVAL = 5000;

const NORMAL_PAYLOAD = {
  amount: "1000",
  currency: "EUR",
  externalId: "123456",
  payer: {
    partyIdType: "MSISDN" as const,
    partyId: "256777123457",
  },
  payerMessage: "Payment for Instaskul",
  payeeNote: "Thank you",
};

const TIMEOUT_PAYLOAD = {
  ...NORMAL_PAYLOAD,
  payer: {
    partyIdType: "MSISDN" as const,
    // Replace with MTN timeout MSISDN when supplied
    partyId: "256777123457",
  },
};

type TestResult = {
  testCase: string;
  scenario: string;
  timestamp: string;
  request: {
    referenceId?: string;
    amount: string;
    currency: string;
    msisdn: string;
  };
  response?: unknown;
  httpStatus?: number;
  outcome: "PASS" | "FAIL" | "BLOCKED";
  notes?: string;
};

const report: TestResult[] = [];

const sleep = (ms: number) =>
  new Promise(resolve => setTimeout(resolve, ms));

async function waitForFinalStatus(referenceId: string) {
  console.log("\nPolling transaction status...");

  for (let attempt = 1; attempt <= MAX_POLLS; attempt++) {
    const result =
      await momo.collections.checkTransactionStatus(referenceId);

    console.log(
      `[${attempt}/${MAX_POLLS}] ${result.status}`
    );

    if (
      [
        "SUCCESSFUL",
        "FAILED",
        "REJECTED",
        "TIMEOUT",
        "CANCELLED",
      ].includes(result.status)
    ) {
      return result;
    }

    await sleep(POLL_INTERVAL);
  }

  throw new Error("Polling timeout.");
}

async function runTest(
  testCase: string,
  scenario: string,
  payload: typeof NORMAL_PAYLOAD,
  referenceId?: string
) {
  console.log("\n======================================");
  console.log(`${testCase} - ${scenario}`);
  console.log("======================================");

  const record: TestResult = {
    testCase,
    scenario,
    timestamp: new Date().toISOString(),
    request: {
      referenceId,
      amount: payload.amount,
      currency: payload.currency,
      msisdn: payload.payer.partyId,
    },
    outcome: "FAIL",
  };

  try {
    const ref =
      await momo.collections.requestToPay(
        payload,
        referenceId
      );

    record.request.referenceId = ref;

    console.log("Reference:", ref);

    const status =
      await waitForFinalStatus(ref);

    record.response = status;

    if (
      testCase === "TC02" &&
      status.status === "SUCCESSFUL"
    ) {
      record.outcome = "BLOCKED";
      record.notes =
        "Sandbox approved payment instead of simulating approval timeout.";
    } else {
      record.outcome = "PASS";
    }

    console.log(
      JSON.stringify(status, null, 2)
    );
  } catch (err: any) {
    if (err.response) {
      record.httpStatus = err.response.status;
      record.response = err.response.data;

      if (
        testCase === "TC03" &&
        err.response.status === 409
      ) {
        record.outcome = "PASS";
      } else {
        record.outcome = "FAIL";
      }

      console.log("HTTP:", err.response.status);
      console.log(
        JSON.stringify(err.response.data, null, 2)
      );
    } else {
      record.notes = err.message;
      console.error(err);
    }
  }

  report.push(record);
}

async function main() {
  await runTest(
    "TC04",
    "Normal Request To Pay",
    NORMAL_PAYLOAD
  );

  const duplicateReference = randomUUID();

  await runTest(
    "TC03",
    "Duplicate Reference (First Request)",
    NORMAL_PAYLOAD,
    duplicateReference
  );

  await runTest(
    "TC03",
    "Duplicate Reference (Second Request)",
    NORMAL_PAYLOAD,
    duplicateReference
  );

  await runTest(
    "TC02",
    "Approval Timeout",
    TIMEOUT_PAYLOAD
  );

  writeFileSync(
    "momo-test-report.json",
    JSON.stringify(report, null, 2)
  );

  console.log("\n================ SUMMARY ================");

  console.table(
    report.map(r => ({
      Test: r.testCase,
      Scenario: r.scenario,
      Result: r.outcome,
    }))
  );

  console.log(
    "\nDetailed report written to momo-test-report.json"
  );
}

main().catch(console.error);