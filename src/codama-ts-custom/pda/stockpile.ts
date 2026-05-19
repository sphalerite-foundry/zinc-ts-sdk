import { Connection, PublicKey } from "@solana/web3.js";
import {
  getStockpileDecoder,
  getStockpileExtrasDecoder,
  getStockpileWinnersDecoder,
  type Stockpile as CanonicalStockpile,
  type StockpileExtras as CanonicalStockpileExtras,
  type StockpileWinners as CanonicalStockpileWinners,
} from "../../codama-ts/accounts";
import { STOCKPILE_SEED, ZINC_PROGRAM_ID } from "../constants";
import { fetchDecodedAccount, type DecodedAccount } from "./shared";

const TEXT_ENCODER = new TextEncoder();
const STOCKPILE_EXTRAS_SEED = "stockpile-extras";
const STOCKPILE_WINNERS_SEED = "stockpile-winners";

export type Stockpile = CanonicalStockpile;
export type StockpileExtras = CanonicalStockpileExtras;
export type StockpileWinners = CanonicalStockpileWinners;
export type DecodedStockpileAccount = DecodedAccount<Stockpile>;
export type DecodedStockpileExtrasAccount = DecodedAccount<StockpileExtras>;
export type DecodedStockpileWinnersAccount = DecodedAccount<StockpileWinners>;

/** Serializes one stockpile id as little-endian PDA seed bytes. */
function getStockpileIdBytes(stockpileId: number | bigint): Uint8Array {
  const bytes = new Uint8Array(8);
  new DataView(bytes.buffer).setBigUint64(0, BigInt(stockpileId), true);
  return bytes;
}

/** Derives one stockpile PDA by id. */
export function getStockpileAddress(
  stockpileId: number | bigint,
  programId: PublicKey = ZINC_PROGRAM_ID,
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [TEXT_ENCODER.encode(STOCKPILE_SEED), getStockpileIdBytes(stockpileId)],
    programId,
  );
}

/** Derives the singleton stockpile-extras PDA. */
export function getStockpileExtrasAddress(
  programId: PublicKey = ZINC_PROGRAM_ID,
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [TEXT_ENCODER.encode(STOCKPILE_EXTRAS_SEED)],
    programId,
  );
}

/** Derives the ranked winners PDA for one stockpile cycle. */
export function getStockpileWinnersAddress(
  stockpileId: number | bigint,
  programId: PublicKey = ZINC_PROGRAM_ID,
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [
      TEXT_ENCODER.encode(STOCKPILE_WINNERS_SEED),
      getStockpileIdBytes(stockpileId),
    ],
    programId,
  );
}

/** Fetches and decodes one stockpile account. */
export async function fetchStockpileAccount(
  connection: Connection,
  stockpileAddress: PublicKey,
): Promise<DecodedStockpileAccount> {
  return fetchDecodedAccount(
    connection,
    stockpileAddress,
    getStockpileDecoder(),
    "Stockpile",
  );
}

/** Fetches and decodes the singleton stockpile-extras account. */
export async function fetchStockpileExtrasAccount(
  connection: Connection,
  stockpileExtrasAddress: PublicKey,
): Promise<DecodedStockpileExtrasAccount> {
  return fetchDecodedAccount(
    connection,
    stockpileExtrasAddress,
    getStockpileExtrasDecoder(),
    "StockpileExtras",
  );
}

/** Fetches and decodes one stockpile ranked winners account. */
export async function fetchStockpileWinnersAccount(
  connection: Connection,
  stockpileWinnersAddress: PublicKey,
): Promise<DecodedStockpileWinnersAccount> {
  return fetchDecodedAccount(
    connection,
    stockpileWinnersAddress,
    getStockpileWinnersDecoder(),
    "StockpileWinners",
  );
}
