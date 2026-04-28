import { Connection, PublicKey } from "@solana/web3.js";
import {
  getStockpileDecoder,
  getStockpileExtrasDecoder,
  type Stockpile as CanonicalStockpile,
  type StockpileExtras as CanonicalStockpileExtras,
} from "../../codama-ts/accounts";
import { STOCKPILE_SEED, ZINC_PROGRAM_ID } from "../constants";
import { fetchDecodedAccount, type DecodedAccount } from "./shared";

const TEXT_ENCODER = new TextEncoder();
const STOCKPILE_EXTRAS_SEED = "stockpile-extras";

export type Stockpile = CanonicalStockpile;
export type StockpileExtras = CanonicalStockpileExtras;
export type DecodedStockpileAccount = DecodedAccount<Stockpile>;
export type DecodedStockpileExtrasAccount = DecodedAccount<StockpileExtras>;

/** Serializes one stockpile id as little-endian PDA seed bytes. */
function getStockpileIdBytes(stockpileId: number | bigint): Uint8Array {
  const bytes = new Uint8Array(8);
  new DataView(bytes.buffer).setBigUint64(0, BigInt(stockpileId), true);
  return bytes;
}

/** Derives one stockpile PDA by id. */
export function getStockpileAddress(
  stockpileId: number | bigint,
  programId: PublicKey = ZINC_PROGRAM_ID
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [TEXT_ENCODER.encode(STOCKPILE_SEED), getStockpileIdBytes(stockpileId)],
    programId
  );
}

/** Derives the singleton stockpile-extras PDA. */
export function getStockpileExtrasAddress(
  programId: PublicKey = ZINC_PROGRAM_ID
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [TEXT_ENCODER.encode(STOCKPILE_EXTRAS_SEED)],
    programId
  );
}

/** Fetches and decodes one stockpile account. */
export async function fetchStockpileAccount(
  connection: Connection,
  stockpileAddress: PublicKey
): Promise<DecodedStockpileAccount> {
  return fetchDecodedAccount(
    connection,
    stockpileAddress,
    getStockpileDecoder(),
    "Stockpile"
  );
}

/** Fetches and decodes the singleton stockpile-extras account. */
export async function fetchStockpileExtrasAccount(
  connection: Connection,
  stockpileExtrasAddress: PublicKey
): Promise<DecodedStockpileExtrasAccount> {
  return fetchDecodedAccount(
    connection,
    stockpileExtrasAddress,
    getStockpileExtrasDecoder(),
    "StockpileExtras"
  );
}
