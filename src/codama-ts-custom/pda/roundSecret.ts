import { Connection, PublicKey } from "@solana/web3.js";
import {
  getRoundSecretDecoder,
  type RoundSecret,
} from "../../codama-ts/accounts";
import { ROUND_SECRET_SEED, ZINC_PROGRAM_ID } from "../constants";
import { fetchDecodedAccount, type DecodedAccount } from "./shared";

const TEXT_ENCODER = new TextEncoder();

export type DecodedRoundSecretAccount = DecodedAccount<RoundSecret>;

function getRoundIdBytes(roundId: number | bigint): Uint8Array {
  const bytes = new Uint8Array(8);
  new DataView(bytes.buffer).setBigUint64(0, BigInt(roundId), true);
  return bytes;
}

export function getRoundSecretAddress(
  roundId: number | bigint,
  programId: PublicKey = ZINC_PROGRAM_ID
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [TEXT_ENCODER.encode(ROUND_SECRET_SEED), getRoundIdBytes(roundId)],
    programId
  );
}

export async function fetchRoundSecretAccount(
  connection: Connection,
  roundSecretAddress: PublicKey
): Promise<DecodedRoundSecretAccount> {
  return fetchDecodedAccount(
    connection,
    roundSecretAddress,
    getRoundSecretDecoder(),
    "RoundSecret"
  );
}
