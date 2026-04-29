import { Connection, PublicKey } from "@solana/web3.js";
import { getRoundDecoder, type Round } from "../../codama-ts/accounts";
import {
  ROUND_SEED,
  ROUND_ZINC_PAYOUT_TOKEN_ACCOUNT_SEED,
  ZINC_PROGRAM_ID,
} from "../constants";
import { fetchDecodedAccount, type DecodedAccount } from "./shared";

const TEXT_ENCODER = new TextEncoder();

export type DecodedRoundAccount = DecodedAccount<Round>;

function getRoundIdBytes(roundId: number | bigint): Uint8Array {
  const bytes = new Uint8Array(8);
  new DataView(bytes.buffer).setBigUint64(0, BigInt(roundId), true);
  return bytes;
}

export function getRoundAddress(
  roundId: number | bigint,
  programId: PublicKey = ZINC_PROGRAM_ID,
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [TEXT_ENCODER.encode(ROUND_SEED), getRoundIdBytes(roundId)],
    programId,
  );
}

/** Derives the round-owned ZINC payout vault for one round. */
export function getRoundZincPayoutTokenAccountAddress(
  roundId: number | bigint,
  treasury: PublicKey,
  zincMint: PublicKey,
  programId: PublicKey = ZINC_PROGRAM_ID,
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [
      TEXT_ENCODER.encode(ROUND_ZINC_PAYOUT_TOKEN_ACCOUNT_SEED),
      getRoundIdBytes(roundId),
      treasury.toBuffer(),
      zincMint.toBuffer(),
    ],
    programId,
  );
}

export async function fetchRoundAccount(
  connection: Connection,
  roundAddress: PublicKey,
): Promise<DecodedRoundAccount> {
  return fetchDecodedAccount(
    connection,
    roundAddress,
    getRoundDecoder(),
    "Round",
  );
}
