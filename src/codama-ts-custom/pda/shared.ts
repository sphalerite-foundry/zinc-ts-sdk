import { type ReadonlyUint8Array } from "@solana/kit";
import { Connection, PublicKey } from "@solana/web3.js";

export type DecodedAccount<T> = {
  address: PublicKey;
  data: T;
};

const ACCOUNT_FETCH_MAX_ATTEMPTS = 6;
const ACCOUNT_FETCH_RETRY_DELAY_MS = 250;

export async function fetchDecodedAccount<T>(
  connection: Connection,
  accountAddress: PublicKey,
  decoder: { decode(data: ReadonlyUint8Array): T },
  accountName: string,
): Promise<DecodedAccount<T>> {
  const accountInfo = await getAccountInfoWithRetry(connection, accountAddress);

  if (!accountInfo) {
    throw new Error(
      `${accountName} account not found: ${accountAddress.toBase58()}`,
    );
  }

  return {
    address: accountAddress,
    data: decoder.decode(accountInfo.data),
  };
}

async function getAccountInfoWithRetry(
  connection: Connection,
  accountAddress: PublicKey,
): ReturnType<Connection["getAccountInfo"]> {
  let lastError: unknown = null;
  for (let attempt = 1; attempt <= ACCOUNT_FETCH_MAX_ATTEMPTS; attempt++) {
    try {
      return await connection.getAccountInfo(accountAddress);
    } catch (error) {
      lastError = error;
      if (
        attempt === ACCOUNT_FETCH_MAX_ATTEMPTS ||
        !isRetryableFetchError(error)
      ) {
        throw error;
      }
      await sleep(ACCOUNT_FETCH_RETRY_DELAY_MS * attempt);
    }
  }
  throw lastError;
}

function isRetryableFetchError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return message.includes("fetch failed");
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
