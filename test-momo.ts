import { config } from "dotenv";
config({ path: "./.env.local" });

import { randomUUID } from "node:crypto";
import { writeFileSync } from "node:fs";
import { momo } from "./lib/momo";

type Outcome = "PASS" | "FAIL" | "BLOCKED";

type TestResult = {
  testCase: string;
  method: "POST" | "GET";
  scenario: string;
  timestamp: string;
  durationMs?: number;
  httpStatus?: number;
  referenceId?: string;
  transactionStatus?: string;
  response?: unknown;
  outcome: Outcome;
  notes?: string;
};

type TestDefinition = {
  id: string;
  method: "POST" | "GET";
  scenario: string;
  run: () => Promise<{
    status?: number;
    body?: unknown;
    referenceId?: string;
    transactionStatus?: string;
    notes?: string;
  }>;
  evaluate: (
    response: {
      status?: number;
      body?: unknown;
      referenceId?: string;
      transactionStatus?: string;
      notes?: string;
    }
  ) => { outcome: Outcome; notes?: string };
};

const report: TestResult[] = [];

const NORMAL_PAYLOAD = {
  amount: "1000",
  currency: "EUR",
  externalId: randomUUID(),
  payer: {
    partyIdType: "MSISDN" as const,
    partyId: process.env.MOMO_TEST_MSISDN ?? "256777123457",
  },
  payerMessage: "MoMo SIT test",
  payeeNote: "Sandbox test",
};

const is2xx = (status?: number) =>
  status !== undefined && status >= 200 && status < 300;

const INVALID_MSISDN = "256000000000";
const STATUS_POLL_INTERVAL_MS = 5_000;
const STATUS_POLL_ATTEMPTS = 6;

let transactionReferenceId = process.env.MOMO_TEST_REFERENCE_ID;

function getHttpError(err: unknown): {
  status?: number;
  body?: unknown;
  message: string;
} {
  const error = err as {
    message?: string;
    response?: { status?: number; data?: unknown };
  };

  return {
    status: error.response?.status,
    body: error.response?.data,
    message: error.message ?? "Unknown request error",
  };
}

/**
 * Adapt these functions to the actual interface in ./lib/momo.
 *
 * Negative tests must allow overriding the headers and body.
 * If the current momo client doesn't expose that capability,
 * add a raw-request method to lib/momo.ts.
 */
const api = {
  async requestToPay(
    payload: typeof NORMAL_PAYLOAD,
    options: {
      referenceId: string;
      subscriptionKey?: string;
      accessToken?: string;
      targetEnvironment?: string;
    },
  ) {
    return momo.collections.requestToPayRaw(
      payload,
      options,
    );
  },

  async checkTransactionStatus(
    referenceId: string,
    options: {
      accessToken?: string;
      subscriptionKey?: string;
      targetEnvironment?: string;
    },
  ) {
    return momo.collections.checkTransactionStatusRaw(referenceId, options);
  },
};

async function capture(
  operation: () => Promise<unknown>,
): Promise<{
  status?: number;
  body?: unknown;
  referenceId?: string;
  transactionStatus?: string;
  notes?: string;
}> {
  const started = Date.now();

  try {
    const body = await operation() as {
      status?: number;
      statusCode?: number;
      data?: unknown;
      referenceId?: unknown;
    };

    return {
      status: body.status ?? body.statusCode,
      body: body.data ?? body,
      referenceId: typeof body.referenceId === "string"
        ? body.referenceId
        : undefined,
      notes: `Completed in ${Date.now() - started} ms`,
    };
  } catch (err) {
    const parsed = getHttpError(err);

    return {
      status: parsed.status,
      body: parsed.body,
      notes: parsed.message,
    };
  }
}

async function pollTransactionStatus(referenceId: string): Promise<{
  transactionStatus?: string;
  notes?: string;
}> {
  let transactionStatus: string | undefined;

  for (let attempt = 0; attempt < STATUS_POLL_ATTEMPTS; attempt += 1) {
    if (attempt > 0) {
      await new Promise(resolve =>
        setTimeout(resolve, STATUS_POLL_INTERVAL_MS),
      );
    }

    const response = await capture(() =>
      api.checkTransactionStatus(referenceId, {}),
    );

    if (response.status === undefined || response.status < 200 || response.status >= 300) {
      return {
        notes: `Status lookup failed with HTTP ${
          response.status ?? "unavailable"
        }: ${response.notes ?? "No response details"}`,
      };
    }

    const data = response.body as { status?: unknown } | undefined;

    transactionStatus =
      typeof data?.status === "string" ? data.status : undefined;

    if (transactionStatus && transactionStatus !== "PENDING") {
      return { transactionStatus };
    }
  }

  return {
    transactionStatus,
    notes: `Transaction remained ${
      transactionStatus ?? "without a reported status"
    } after ${STATUS_POLL_ATTEMPTS} status checks.`,
  };
}

function expectStatus(
  response: { status?: number; body?: unknown },
  expected: number[],
) {
  if (response.status === undefined) {
    return {
      outcome: "BLOCKED" as const,
      notes: "No HTTP status captured; inspect connectivity and client errors.",
    };
  }

  return expected.includes(response.status)
    ? { outcome: "PASS" as const }
    : {
        outcome: "FAIL" as const,
        notes: `Expected HTTP ${expected.join(" or ")}; received ${response.status}.`,
      };
}

const tests: TestDefinition[] = [
  {
    id: "TC02-05",
    method: "POST",
    scenario: "Incomplete request information",
    run: () => {
      const payload = { ...NORMAL_PAYLOAD } as Record<string, unknown>;
      delete payload.amount;

      return capture(() =>
        api.requestToPay(
          payload as typeof NORMAL_PAYLOAD,
          { referenceId: randomUUID() },
        ),
      );
    },
    evaluate: response => expectStatus(response, [400, 422]),
  },
  {
    id: "TC02-07",
    method: "POST",
    scenario: "Invalid B-Party MSISDN",
    run: () => {
      const payload = {
        ...NORMAL_PAYLOAD,
        payer: {
          ...NORMAL_PAYLOAD.payer,
          partyId: INVALID_MSISDN,
        },
      };

      return (async () => {
        const response = await capture(() =>
          api.requestToPay(payload, { referenceId: randomUUID() }),
        );

        if (response.status === 202 && response.referenceId) {
          const diagnostic = await pollTransactionStatus(response.referenceId);
          response.transactionStatus = diagnostic.transactionStatus;
          if (diagnostic.notes) {
            response.notes = `${response.notes ?? ""} ${diagnostic.notes}`.trim();
          }
        }

        return response;
      })();
    },
    evaluate: response => {
      if (response.status === undefined) {
        return {
          outcome: "BLOCKED",
          notes: "No HTTP response. Check sandbox connectivity and test-data support.",
        };
      }

      const verdict = expectStatus(response, [400, 404, 422]);

      if (response.status === 202) {
        return {
          ...verdict,
          notes: `${verdict.notes} ${
            response.notes ?? ""
          } Asynchronous transaction status: ${
            response.transactionStatus ?? "not available"
          }.`,
        };
      }

      return verdict;
    },
  },
  {
    id: "TC02-09",
    method: "POST",
    scenario: "Invalid subscription key",
    run: () =>
      capture(() =>
        api.requestToPay(NORMAL_PAYLOAD, {
          referenceId: randomUUID(),
          subscriptionKey: "invalid-subscription-key",
        }),
      ),
    evaluate: response => expectStatus(response, [401, 403]),
  },
  {
    id: "TC02-10",
    method: "POST",
    scenario: "Invalid target environment",
    run: () =>
      capture(() =>
        api.requestToPay(NORMAL_PAYLOAD, {
          referenceId: randomUUID(),
          targetEnvironment: "invalid-environment",
        }),
      ),
    evaluate: response => expectStatus(response, [400, 401, 403, 404]),
  },
  {
    id: "TC02-11",
    method: "POST",
    scenario: "Invalid OAuth bearer token",
    run: () =>
      capture(() =>
        api.requestToPay(NORMAL_PAYLOAD, {
          referenceId: randomUUID(),
          accessToken: "invalid-token",
        }),
      ),
    evaluate: response => expectStatus(response, [401]),
  },
  {
    id: "TC02-15",
    method: "GET",
    scenario: "Invalid target environment",
    run: () =>
      capture(() =>
        api.checkTransactionStatus(
          transactionReferenceId ?? "",
          { targetEnvironment: "invalid-environment" },
        ),
      ),
    evaluate: response => expectStatus(response, [400, 401, 403, 404]),
  },
  {
    id: "TC02-16",
    method: "GET",
    scenario: "Invalid OAuth bearer token",
    run: () =>
      capture(() =>
        api.checkTransactionStatus(
          transactionReferenceId ?? "",
          { accessToken: "invalid-token" },
        ),
      ),
    evaluate: response => expectStatus(response, [401]),
  },
];

async function main() {
  for (const test of tests) {
    console.log(`\n${test.id}: ${test.scenario}`);

    // A GET status test requires a real reference ID.
    if (
      test.method === "GET" &&
      !transactionReferenceId
    ) {
      report.push({
        testCase: test.id,
        method: test.method,
        scenario: test.scenario,
        timestamp: new Date().toISOString(),
        outcome: "BLOCKED",
        notes: "Set MOMO_TEST_REFERENCE_ID to a valid sandbox transaction reference.",
      });
      continue;
    }

    const started = Date.now();

    try {
      const response = await test.run();
      const verdict = test.evaluate(response);

      const result: TestResult = {
        testCase: test.id,
        method: test.method,
        scenario: test.scenario,
        timestamp: new Date().toISOString(),
        durationMs: Date.now() - started,
        httpStatus: response.status,
        referenceId: response.referenceId,
        transactionStatus: response.transactionStatus,
        response: response.body,
        outcome: verdict.outcome,
        notes: verdict.notes ?? response.notes,
      };

      if (test.id === "TC02-07" && response.referenceId) {
        transactionReferenceId = response.referenceId;
      }

      report.push(result);
      console.log(result);
    } catch (err) {
      report.push({
        testCase: test.id,
        method: test.method,
        scenario: test.scenario,
        timestamp: new Date().toISOString(),
        durationMs: Date.now() - started,
        outcome: "BLOCKED",
        notes: (err as Error).message,
      });
    }
  }

  writeFileSync(
    "momo-test-report.json",
    JSON.stringify(report, null, 2),
  );

  console.log("\nSIT SUMMARY");
  console.table(
    report.map(({ testCase, method, scenario, outcome, httpStatus }) => ({
      testCase,
      method,
      scenario,
      httpStatus: httpStatus ?? "—",
      outcome,
    })),
  );

  console.log("\nReport saved to momo-test-report.json");
}

main().catch(err => {
  console.error("SIT runner failed:", err);
  process.exitCode = 1;
});
