import { Connection, PublicKey } from "@solana/web3.js";
import {
  getStockpileSecretDecoder,
  type StockpileSecret as CanonicalStockpileSecret,
} from "../../codama-ts/accounts";
import { STOCKPILE_SECRET_SEED, ZINC_PROGRAM_ID } from "../constants";
import { fetchDecodedAccount, type DecodedAccount } from "./shared";

const TEXT_ENCODER = new TextEncoder();

export type StockpileSecret = CanonicalStockpileSecret;
export type DecodedStockpileSecretAccount = DecodedAccount<StockpileSecret>;

/** Serializes one stockpile id as little-endian PDA seed bytes. */
function getStockpileIdBytes(stockpileId: number | bigint): Uint8Array {
  const bytes = new Uint8Array(8);
  new DataView(bytes.buffer).setBigUint64(0, BigInt(stockpileId), true);
  return bytes;
}

/** Derives one stockpile-secret PDA by stockpile id. */
export function getStockpileSecretAddress(
  stockpileId: number | bigint,
  programId: PublicKey = ZINC_PROGRAM_ID
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [
      TEXT_ENCODER.encode(STOCKPILE_SECRET_SEED),
      getStockpileIdBytes(stockpileId),
    ],
    programId
  );
}

/** Fetches and decodes one stockpile-secret account. */
export async function fetchStockpileSecretAccount(
  connection: Connection,
  stockpileSecretAddress: PublicKey
): Promise<DecodedStockpileSecretAccount> {
  return fetchDecodedAccount(
    connection,
    stockpileSecretAddress,
    getStockpileSecretDecoder(),
    "StockpileSecret"
  );
}
