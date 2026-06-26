import { config } from "dotenv";
config({ path: "./.env.local" });

import { momo } from "./lib/momo";

(async () => {
  try {
    console.log("=== DISBURSEMENT ACCOUNT BALANCE TEST ===");

    const balance =
      await momo.disbursements.getBalance();

    console.log(
      JSON.stringify(balance, null, 2)
    );

  } catch (error: any) {
    console.error(
      error?.response?.data ??
      error?.message ??
      error
    );
  }
})();