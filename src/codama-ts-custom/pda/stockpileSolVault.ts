import { Connection, PublicKey } from "@solana/web3.js";
import {
  getStockpileSolVaultDecoder,
  type StockpileSolVault as CanonicalStockpileSolVault,
} from "../../codama-ts/accounts";
import { STOCKPILE_SOL_VAULT_SEED, ZINC_PROGRAM_ID } from "../constants";
import { fetchDecodedAccount, type DecodedAccount } from "./shared";

const TEXT_ENCODER = new TextEncoder();

export type StockpileSolVault = CanonicalStockpileSolVault;
export type DecodedStockpileSolVaultAccount = DecodedAccount<StockpileSolVault>;

export function getStockpileSolVaultAddress(
  programId: PublicKey = ZINC_PROGRAM_ID
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [TEXT_ENCODER.encode(STOCKPILE_SOL_VAULT_SEED)],
    programId
  );
}

export async function fetchStockpileSolVaultAccount(
  connection: Connection,
  stockpileSolVaultAddress: PublicKey
): Promise<DecodedStockpileSolVaultAccount> {
  return fetchDecodedAccount(
    connection,
    stockpileSolVaultAddress,
    getStockpileSolVaultDecoder(),
    "StockpileSolVault"
  );
}
