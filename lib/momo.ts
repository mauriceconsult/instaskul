import "dotenv/config";
import axios, { type AxiosRequestConfig } from "axios";
import { v4 as uuidv4 } from "uuid";

export interface RequestToPayPayload {
  amount: string;
  currency: string;
  externalId: string;
  payer: {
    partyIdType: "MSISDN";
    partyId: string;
  };
  payerMessage: string;
  payeeNote: string;
}

export interface TransferPayload {
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

export interface CollectionRequestOptions {
  referenceId?: string;
  subscriptionKey?: string;
  accessToken?: string;
  targetEnvironment?: string;
}

export interface CollectionApiResponse {
  status: number;
  data: unknown;
  referenceId?: string;
}

const getConfig = (names: string[]) => {
  const values = Object.fromEntries(
    names.map((name) => [name, process.env[name]]),
  );

  const missing = names.filter((name) => !values[name]);

  if (missing.length) {
    throw new Error(`Missing MoMo environment variables: ${missing.join(", ")}`);
  }

  return values as Record<string, string>;
};

const baseUrl = () =>
  getConfig(["MOMO_TARGET_ENVIRONMENT"]).MOMO_TARGET_ENVIRONMENT.replace(/\/+$/, "");

const targetEnvironment = () =>
  process.env.MOMO_API_TARGET_ENVIRONMENT ?? "sandbox";

type ApiResponse = {
  status: number;
  data: unknown;
};

async function request(
  config: AxiosRequestConfig,
): Promise<ApiResponse> {
  const response = await axios.request({
    ...config,
    timeout: 30_000,
    validateStatus: () => true,
  });

  return {
    status: response.status,
    data: response.data,
  };
}


const assertSuccess = (response: CollectionApiResponse) => {
  if (response.status < 200 || response.status >= 300) {
    const error = new Error(
      `MoMo API request failed with HTTP ${response.status}`,
    ) as Error & {
      response?: { status: number; data: unknown };
    };

    error.response = {
      status: response.status,
      data: response.data,
    };

    throw error;
  }

  return response;
};

const basicAuth = (user: string, secret: string) =>
  `Basic ${Buffer.from(`${user}:${secret}`).toString("base64")}`;

const commonHeaders = (
  subscriptionKey: string,
  accessToken: string,
  options: CollectionRequestOptions = {},
) => ({
  "X-Target-Environment":
    options.targetEnvironment ?? targetEnvironment(),
  "Ocp-Apim-Subscription-Key":
    options.subscriptionKey ?? subscriptionKey,
  Authorization: `Bearer ${options.accessToken ?? accessToken}`,
});

const momo = {
  collections: {
    async getAccessToken(): Promise<string> {
      const env = getConfig([
        "MOMO_PRIMARY_KEY",
        "MOMOUSER_ID",
        "MOMOUSER_SECRET",
      ]);

      const response = await request({
        method: "POST",
        url: `${baseUrl()}/collection/token/`,
        headers: {
          "Ocp-Apim-Subscription-Key": env.MOMO_PRIMARY_KEY,
          Authorization: basicAuth(
            env.MOMOUSER_ID,
            env.MOMOUSER_SECRET,
          ),
        },
      });

      assertSuccess(response);

      const token = (response.data as { access_token?: string })?.access_token;

      if (!token) {
        throw new Error("MoMo token response did not contain access_token");
      }

      return token;
    },

    // Raw responses are useful for SIT negative tests.
    // Invalid accessToken values are sent unchanged.
 
async requestToPayRaw(
  payload: Partial<RequestToPayPayload>,
  options: CollectionRequestOptions = {},
): Promise<CollectionApiResponse> {
  const env = getConfig(["MOMO_PRIMARY_KEY"]);
  const token =
    options.accessToken ?? await momo.collections.getAccessToken();
  const referenceId = options.referenceId ?? uuidv4();

  const response = await request({
    method: "POST",
    url: `${baseUrl()}/collection/v1_0/requesttopay`,
    data: payload,
    headers: {
      ...commonHeaders(env.MOMO_PRIMARY_KEY, token, options),
      "X-Reference-Id": referenceId,
      "Content-Type": "application/json",
    },
  });

  return {
    ...response,
    referenceId,
  };
},
    async requestToPay(
      payload: RequestToPayPayload,
      referenceId?: string,
    ): Promise<string> {
      const response = await momo.collections.requestToPayRaw(payload, {
        referenceId,
      });

      assertSuccess(response);
      return response.referenceId!;
    },

    async checkTransactionStatusRaw(
      referenceId: string,
      options: CollectionRequestOptions = {},
    ): Promise<CollectionApiResponse> {
      const env = getConfig(["MOMO_PRIMARY_KEY"]);
      const token = options.accessToken ?? await momo.collections.getAccessToken();

      const response = await request({
        method: "GET",
        url: `${baseUrl()}/collection/v1_0/requesttopay/${encodeURIComponent(referenceId)}`,
        headers: commonHeaders(env.MOMO_PRIMARY_KEY, token, options),
      });

      return { ...response, referenceId };
    },

    async checkTransactionStatus(referenceId: string): Promise<{
      status: string;
      [key: string]: unknown;
    }> {
      const response =
        await momo.collections.checkTransactionStatusRaw(referenceId);

      assertSuccess(response);
      return response.data as {
        status: string;
        [key: string]: unknown;
      };
    },
  },

  disbursements: {
    async getAccessToken(): Promise<string> {
      const env = getConfig([
        "MOMO_PRIMARY_KEY_DISBURSEMENTS",
        "MOMO_DISBURSE_USER_ID",
        "MOMO_DISBURSE_USER_SECRET",
      ]);

      const response = await request({
        method: "POST",
        url: `${baseUrl()}/disbursement/token/`,
        headers: {
          "Ocp-Apim-Subscription-Key":
            env.MOMO_PRIMARY_KEY_DISBURSEMENTS,
          Authorization: basicAuth(
            env.MOMO_DISBURSE_USER_ID,
            env.MOMO_DISBURSE_USER_SECRET,
          ),
        },
      });

      assertSuccess(response);

      const token = (response.data as { access_token?: string })?.access_token;

      if (!token) {
        throw new Error("MoMo token response did not contain access_token");
      }

      return token;
    },

    async transfer(payload: TransferPayload): Promise<string> {
      const env = getConfig(["MOMO_PRIMARY_KEY_DISBURSEMENTS"]);
      const token = await momo.disbursements.getAccessToken();
      const referenceId = uuidv4();

      const response = await request({
        method: "POST",
        url: `${baseUrl()}/disbursement/v1_0/transfer`,
        data: payload,
        headers: {
          ...commonHeaders(
            env.MOMO_PRIMARY_KEY_DISBURSEMENTS,
            token,
          ),
          "X-Reference-Id": referenceId,
          "Content-Type": "application/json",
        },
      });

      assertSuccess(response);
      return referenceId;
    },

    async validateAccountHolder(
      accountHolderIdType: string,
      accountHolderId: string,
    ) {
      const env = getConfig(["MOMO_PRIMARY_KEY_DISBURSEMENTS"]);
      const token = await momo.disbursements.getAccessToken();

      const response = await request({
        method: "GET",
        url: `${baseUrl()}/disbursement/v1_0/accountholder/${encodeURIComponent(accountHolderIdType)}/${encodeURIComponent(accountHolderId)}/active`,
        headers: commonHeaders(
          env.MOMO_PRIMARY_KEY_DISBURSEMENTS,
          token,
        ),
      });

      assertSuccess(response);
      return response.data;
    },

    async getTransactionStatus(referenceId: string) {
      const env = getConfig(["MOMO_PRIMARY_KEY_DISBURSEMENTS"]);
      const token = await momo.disbursements.getAccessToken();

      const response = await request({
        method: "GET",
        url: `${baseUrl()}/disbursement/v1_0/transfer/${encodeURIComponent(referenceId)}`,
        headers: commonHeaders(
          env.MOMO_PRIMARY_KEY_DISBURSEMENTS,
          token,
        ),
      });

      assertSuccess(response);
      return response.data;
    },

    async getBalance() {
      const env = getConfig(["MOMO_PRIMARY_KEY_DISBURSEMENTS"]);
      const token = await momo.disbursements.getAccessToken();

      const response = await request({
        method: "GET",
        url: `${baseUrl()}/disbursement/v1_0/account/balance`,
        headers: commonHeaders(
          env.MOMO_PRIMARY_KEY_DISBURSEMENTS,
          token,
        ),
      });

      assertSuccess(response);
      return response.data;
    },
  },

  accountValidation: {
    async validateAccount(
      accountHolderId: string,
      accountHolderIdType = "msisdn",
    ) {
      const env = getConfig(["MOMO_PRIMARY_KEY"]);
      const token = await momo.collections.getAccessToken();

      const response = await request({
        method: "GET",
        url: `${baseUrl()}/collection/v1_0/accountholder/${encodeURIComponent(accountHolderIdType.toLowerCase())}/${encodeURIComponent(accountHolderId)}/active`,
        headers: commonHeaders(env.MOMO_PRIMARY_KEY, token),
      });

      assertSuccess(response);
      return response.data;
    },
  },

  balance: {
    async getCollectionBalance() {
      const env = getConfig(["MOMO_PRIMARY_KEY"]);
      const token = await momo.collections.getAccessToken();

      const response = await request({
        method: "GET",
        url: `${baseUrl()}/collection/v1_0/account/balance`,
        headers: commonHeaders(env.MOMO_PRIMARY_KEY, token),
      });

      assertSuccess(response);
      return response.data;
    },

    async getDisbursementBalance() {
      return momo.disbursements.getBalance();
    },
  },
};

export { momo };
