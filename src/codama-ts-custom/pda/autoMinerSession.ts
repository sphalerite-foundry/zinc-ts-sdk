import { Connection, PublicKey } from "@solana/web3.js";
import {
  getAutoMinerSessionDecoder,
  type AutoMinerSession,
} from "../../codama-ts/accounts";
import { AUTO_MINER_SESSION_SEED, ZINC_PROGRAM_ID } from "../constants";
import { type DecodedAccount } from "./shared";

const TEXT_ENCODER = new TextEncoder();

export type DecodedAutoMinerSessionAccount = DecodedAccount<AutoMinerSession>;

/** Derives the player-owned auto-miner session PDA for one authority wallet. */
export function getAutoMinerSessionAddress(
  authority: PublicKey,
  programId: PublicKey = ZINC_PROGRAM_ID,
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [TEXT_ENCODER.encode(AUTO_MINER_SESSION_SEED), authority.toBytes()],
    programId,
  );
}

/** Fetches and decodes one optional player-owned auto-miner session account. */
export async function fetchMaybeAutoMinerSessionAccount(
  connection: Connection,
  autoMinerSessionAddress: PublicKey,
): Promise<DecodedAutoMinerSessionAccount | null> {
  const accountInfo = await connection.getAccountInfo(autoMinerSessionAddress);
  if (accountInfo === null) {
    return null;
  }

  return {
    address: autoMinerSessionAddress,
    data: getAutoMinerSessionDecoder().decode(accountInfo.data),
  };
}
