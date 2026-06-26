import { config } from "dotenv";
config({ path: "./.env.local" });

import { momo } from "./lib/momo";

const TEST_CASE = process.argv[2] || "TC01-01";

const scenarios = {
  "TC01-01": {
    type: "MSISDN",
    id: "256774290781",
    description: "VALID ACCOUNT",
  },

  "TC01-02": {
    type: "MSISDN",
    id: "999999999999",
    description: "INVALID ACCOUNT",
  },
};

const scenario =
  scenarios[TEST_CASE as keyof typeof scenarios];

if (!scenario) {
  throw new Error(`Unknown test case: ${TEST_CASE}`);
}

(async () => {
  try {
    console.log(
      `=== ${TEST_CASE} ${scenario.description} ===`
    );
    

    // const result =
    //   await momo.disbursements.validateAccountHolder(
    //     scenario.type,
    //     scenario.id
    //   );
const result =
  await momo.disbursements.accountValidation.validateAccount(
    scenario.id,
    scenario.type.toLowerCase()
  );
    console.log(
      JSON.stringify(
        {
          tc: TEST_CASE,
          accountHolder: scenario.id,
          result,
        },
        null,
        2
      )
    );

  } catch (error: any) {
    console.error(
      error?.response?.data ??
      error?.message ??
      error
    );
  }
})();