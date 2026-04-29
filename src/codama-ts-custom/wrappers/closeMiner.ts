import { PublicKey, TransactionInstruction } from "@solana/web3.js";
import { getCloseMinerInstruction } from "../../codama-ts";
import { getConfigAddress, getMinerAddress, getRoundAddress } from "../pda";
import {
  toTransactionInstruction,
  toTransactionSigner,
} from "../utils/sol-helpers";
import { toAddress } from "./shared";

export type BuildCloseMinerInstruction = {
  /** Crank signer authorized to submit cleanup transactions. */
  signer: PublicKey;
  /** Round id used to derive the round and default miner PDA. */
  roundId: number | bigint;
  /** Player account receiving this miner account's lamports. */
  player: PublicKey;
  /** Explicit miner PDA, used when tests need intentionally mismatched accounts. */
  miner?: PublicKey;
};

/** Builds the post-terminal miner account close instruction. */
export function buildCloseMinerInstruction({
  signer,
  roundId,
  player,
  miner,
}: BuildCloseMinerInstruction): TransactionInstruction {
  const round = getRoundAddress(roundId)[0];
  const minerAddress = miner ?? getMinerAddress(roundId, player)[0];
  const instruction = getCloseMinerInstruction({
    signer: toTransactionSigner(signer),
    config: toAddress(getConfigAddress()[0]),
    round: toAddress(round),
    miner: toAddress(minerAddress),
    player: toAddress(player),
  });
  return toTransactionInstruction(
    instruction as Parameters<typeof toTransactionInstruction>[0],
  );
}
