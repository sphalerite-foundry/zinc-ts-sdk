import { type ReadonlyUint8Array } from "@solana/kit";
import { Connection, PublicKey } from "@solana/web3.js";

export type DecodedAccount<T> = {
  address: PublicKey;
  data: T;
};

export async function fetchDecodedAccount<T>(
  connection: Connection,
  accountAddress: PublicKey,
  decoder: { decode(data: ReadonlyUint8Array): T },
  accountName: string,
): Promise<DecodedAccount<T>> {
  const accountInfo = await connection.getAccountInfo(accountAddress);

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
