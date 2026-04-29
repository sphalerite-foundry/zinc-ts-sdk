import { Connection, PublicKey } from "@solana/web3.js";
import {
  getBuybackSolVaultDecoder,
  type BuybackSolVault,
} from "../../codama-ts/accounts";
import { BUYBACK_SOL_VAULT_SEED, ZINC_PROGRAM_ID } from "../constants";
import { fetchDecodedAccount, type DecodedAccount } from "./shared";

const TEXT_ENCODER = new TextEncoder();

export type DecodedBuybackSolVaultAccount = DecodedAccount<BuybackSolVault>;

/** Derives the singleton buyback SOL custody vault PDA. */
export function getBuybackSolVaultAddress(
  programId: PublicKey = ZINC_PROGRAM_ID,
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [TEXT_ENCODER.encode(BUYBACK_SOL_VAULT_SEED)],
    programId,
  );
}

/** Fetches and decodes the singleton buyback SOL custody vault account. */
export async function fetchBuybackSolVaultAccount(
  connection: Connection,
  buybackSolVaultAddress: PublicKey,
): Promise<DecodedBuybackSolVaultAccount> {
  return fetchDecodedAccount(
    connection,
    buybackSolVaultAddress,
    getBuybackSolVaultDecoder(),
    "BuybackSolVault",
  );
}
