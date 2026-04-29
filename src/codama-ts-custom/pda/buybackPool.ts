import { Connection, PublicKey } from "@solana/web3.js";
import {
  getBuybackPoolDecoder,
  type BuybackPool,
} from "../../codama-ts/accounts";
import { BUYBACK_POOL_SEED, ZINC_PROGRAM_ID } from "../constants";
import { fetchDecodedAccount, type DecodedAccount } from "./shared";

const TEXT_ENCODER = new TextEncoder();

export type DecodedBuybackPoolAccount = DecodedAccount<BuybackPool>;

/** Derives the singleton Meteora buyback pool manifest PDA. */
export function getBuybackPoolAddress(
  programId: PublicKey = ZINC_PROGRAM_ID,
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [TEXT_ENCODER.encode(BUYBACK_POOL_SEED)],
    programId,
  );
}

/** Fetches and decodes the singleton Meteora buyback pool manifest account. */
export async function fetchBuybackPoolAccount(
  connection: Connection,
  buybackPoolAddress: PublicKey,
): Promise<DecodedBuybackPoolAccount> {
  return fetchDecodedAccount(
    connection,
    buybackPoolAddress,
    getBuybackPoolDecoder(),
    "BuybackPool",
  );
}
