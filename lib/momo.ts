import "dotenv/config";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import momoLib from "mtn-momo";

const momo = {
  // === COLLECTIONS 
  collections: {
    async getAccessToken() {
      const { MOMO_TARGET_ENVIRONMENT, MOMO_PRIMARY_KEY, MOMOUSER_ID, MOMOUSER_SECRET } = process.env;
      if (!MOMO_TARGET_ENVIRONMENT || !MOMO_PRIMARY_KEY || !MOMOUSER_ID || !MOMOUSER_SECRET) {
        throw new Error("Missing Collections env vars");
      }
      const authToken = Buffer.from(`${MOMOUSER_ID}:${MOMOUSER_SECRET}`).toString("base64");
      const response = await axios.post(`${MOMO_TARGET_ENVIRONMENT}/collection/token/`, {}, {
        headers: { "Ocp-Apim-Subscription-Key": MOMO_PRIMARY_KEY, Authorization: `Basic ${authToken}` }
      });
      return response.data.access_token;
    },
    async requestToPay(payload: any) {
      const { MOMO_TARGET_ENVIRONMENT, MOMO_PRIMARY_KEY } = process.env;
      const accessToken = await this.getAccessToken();
      const referenceId = uuidv4();
      await axios.post(`${MOMO_TARGET_ENVIRONMENT}/collection/v1_0/requesttopay`, payload, {
        headers: {
          "X-Reference-Id": referenceId,
          "X-Target-Environment": "sandbox",
          "Ocp-Apim-Subscription-Key": MOMO_PRIMARY_KEY,
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return referenceId;
    },
    async checkTransactionStatus(referenceId: string) {
      const { MOMO_TARGET_ENVIRONMENT, MOMO_PRIMARY_KEY } = process.env;
      const accessToken = await this.getAccessToken();
      const response = await axios.get(`${MOMO_TARGET_ENVIRONMENT}/collection/v1_0/requesttopay/${referenceId}`, {
        headers: {
          "X-Target-Environment": "sandbox",
          "Ocp-Apim-Subscription-Key": MOMO_PRIMARY_KEY,
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return response.data;
    },
  },

  // === DISBURSEMENTS ===
  disbursements: {
    // Initialize MoMo library
    momoInstance: momoLib.create({
      callbackHost: process.env.CALLBACK_HOST || "https://www.instaskul.com",
    }),

    // Get Disbursements client
    client: momoLib.Disbursements({
      userSecret: process.env.MOMO_DISBURSE_USER_SECRET!,
      userId: process.env.MOMO_DISBURSE_USER_ID!,
      primaryKey: process.env.MOMO_DISBURSE_PRIMARY_KEY!,
    }),

    async selfServicePayout(adminId: string, amount: string, phoneNumber: string) {
      const payload = {
        amount,
        currency: "EUR",
        externalId: `payout_${adminId}_${Date.now()}`,
        payee: {
          partyIdType: "MSISDN",
          partyId: phoneNumber,
        },
        payerMessage: "Instaskul Self-Service Payout",
        payeeNote: "Your earnings are here!",
      };

      try {
        console.log("Initiating self-service payout:", payload);
        const transactionId = await this.client.transfer(payload);
        console.log("Transaction ID:", transactionId);

        // Optional: Check status after 5s
        setTimeout(async () => {
          const status = await this.client.getTransaction(transactionId);
          console.log("Payout status:", status);
        }, 5000);

        return transactionId;
      } catch (error) {
        console.error("Self-service payout failed:", error);
        throw error;
      }
    },

    async getBalance(adminId: string) {
      try {
        const balance = await this.client.getBalance();
        console.log(`Balance for ${adminId}:`, balance);
        return balance;
      } catch (error) {
        console.error("Balance check failed:", error);
        throw error;
      }
    },
  },
};

export { momo };