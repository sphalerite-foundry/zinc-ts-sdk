import { Connection, PublicKey } from "@solana/web3.js";
import {
  getTreasuryDecoder,
  type Treasury as CanonicalTreasury,
} from "../../codama-ts/accounts";
import {
  BONANZA_TOKEN_ACCOUNT_SEED,
  BUYBACK_FEE_WSOL_TOKEN_ACCOUNT_SEED,
  BUYBACK_FEE_ZINC_TOKEN_ACCOUNT_SEED,
  BUYBACK_TOKEN_ACCOUNT_SEED,
  STAKING_TOKEN_ACCOUNT_SEED,
  STAKING_REWARD_TOKEN_ACCOUNT_SEED,
  STOCKPILE_TOKEN_ACCOUNT_SEED,
  TREASURY_SEED,
  ZINC_PROGRAM_ID,
} from "../constants";
import { fetchDecodedAccount, type DecodedAccount } from "./shared";

const TEXT_ENCODER = new TextEncoder();

export type Treasury = CanonicalTreasury;
export type DecodedTreasuryAccount = DecodedAccount<Treasury>;

/** Derives the singleton treasury PDA. */
export function getTreasuryAddress(
  programId: PublicKey = ZINC_PROGRAM_ID,
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [TEXT_ENCODER.encode(TREASURY_SEED)],
    programId,
  );
}

/** Derives the treasury-owned staking token vault PDA. */
export function getStakingTokenAccountAddress(
  programId: PublicKey = ZINC_PROGRAM_ID,
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [
      TEXT_ENCODER.encode(TREASURY_SEED),
      TEXT_ENCODER.encode(STAKING_TOKEN_ACCOUNT_SEED),
    ],
    programId,
  );
}

/** Derives the treasury-owned staking reward token vault PDA. */
export function getStakingRewardTokenAccountAddress(
  programId: PublicKey = ZINC_PROGRAM_ID,
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [
      TEXT_ENCODER.encode(TREASURY_SEED),
      TEXT_ENCODER.encode(STAKING_REWARD_TOKEN_ACCOUNT_SEED),
    ],
    programId,
  );
}

/** Derives the treasury-owned vault used for rolling Bonanza ZINC. */
export function getBonanzaTokenAccountAddress(
  programId: PublicKey = ZINC_PROGRAM_ID,
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [
      TEXT_ENCODER.encode(TREASURY_SEED),
      TEXT_ENCODER.encode(BONANZA_TOKEN_ACCOUNT_SEED),
    ],
    programId,
  );
}

/** Derives the treasury-owned vault used for rolling Stockpile ZINC. */
export function getStockpileTokenAccountAddress(
  programId: PublicKey = ZINC_PROGRAM_ID,
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [
      TEXT_ENCODER.encode(TREASURY_SEED),
      TEXT_ENCODER.encode(STOCKPILE_TOKEN_ACCOUNT_SEED),
    ],
    programId,
  );
}

/** Derives the treasury-owned ZINC vault used as the direct buyback destination. */
export function getBuybackZincTokenAccountAddress(
  programId: PublicKey = ZINC_PROGRAM_ID,
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [
      TEXT_ENCODER.encode(TREASURY_SEED),
      TEXT_ENCODER.encode(BUYBACK_TOKEN_ACCOUNT_SEED),
    ],
    programId,
  );
}

/** Derives the treasury-owned ZINC vault used for claimed buyback LP fees. */
export function getBuybackFeeZincTokenAccountAddress(
  programId: PublicKey = ZINC_PROGRAM_ID,
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [
      TEXT_ENCODER.encode(TREASURY_SEED),
      TEXT_ENCODER.encode(BUYBACK_FEE_ZINC_TOKEN_ACCOUNT_SEED),
    ],
    programId,
  );
}

/** Derives the treasury-owned WSOL vault used for claimed buyback LP fees. */
export function getBuybackFeeWsolTokenAccountAddress(
  programId: PublicKey = ZINC_PROGRAM_ID,
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [
      TEXT_ENCODER.encode(TREASURY_SEED),
      TEXT_ENCODER.encode(BUYBACK_FEE_WSOL_TOKEN_ACCOUNT_SEED),
    ],
    programId,
  );
}

/** Fetches and decodes one treasury account. */
export async function fetchTreasuryAccount(
  connection: Connection,
  treasuryAddress: PublicKey,
): Promise<DecodedTreasuryAccount> {
  return fetchDecodedAccount(
    connection,
    treasuryAddress,
    getTreasuryDecoder(),
    "Treasury",
  );
}
