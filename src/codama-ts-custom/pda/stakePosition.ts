import { Connection, PublicKey } from "@solana/web3.js";
import {
  getStakePositionDecoder,
  type StakePosition,
} from "../../codama-ts/accounts";
import { ZINC_PROGRAM_ID } from "../constants";

const STAKE_POSITION_SEED = "stake-position";
const TEXT_ENCODER = new TextEncoder();

export type DecodedStakePositionAccount = {
  address: PublicKey;
  data: StakePosition;
};

/** Derives the canonical stake-position PDA for one authority. */
export function getStakePositionAddress(
  authority: PublicKey,
  programId: PublicKey = ZINC_PROGRAM_ID,
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [TEXT_ENCODER.encode(STAKE_POSITION_SEED), authority.toBuffer()],
    programId,
  );
}

/** Loads one optional stake-position snapshot and returns `null` when it is not initialized yet. */
export async function fetchMaybeStakePositionAccount(input: {
  address: PublicKey;
  connection: Connection;
}): Promise<DecodedStakePositionAccount | null> {
  const { address, connection } = input;
  const accountInfo = await connection.getAccountInfo(address);

  if (!accountInfo) {
    return null;
  }

  return {
    address,
    data: getStakePositionDecoder().decode(accountInfo.data),
  };
}
