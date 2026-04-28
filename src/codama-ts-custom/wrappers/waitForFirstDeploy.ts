import { PublicKey, TransactionInstruction } from "@solana/web3.js";
import { getWaitForFirstDeployInstructionAsync } from "../../codama-ts";
import {
  getBoardAddress,
  getConfigAddress,
  getRoundAddress,
  getRoundSecretAddress,
} from "../pda";
import {
  toTransactionInstruction,
  toTransactionSigner,
} from "../utils/sol-helpers";
import { toAddress } from "./shared";

export type BuildWaitForFirstDeployInstruction = {
  signer: PublicKey;
  roundId: number | bigint;
};

export async function buildWaitForFirstDeployInstruction({
  signer,
  roundId,
}: BuildWaitForFirstDeployInstruction): Promise<TransactionInstruction> {
  const config = getConfigAddress()[0];
  const board = getBoardAddress()[0];
  const round = getRoundAddress(roundId)[0];
  const roundSecret = getRoundSecretAddress(roundId)[0];
  const instruction = await getWaitForFirstDeployInstructionAsync({
    signer: toTransactionSigner(signer),
    config: toAddress(config),
    board: toAddress(board),
    round: toAddress(round),
    roundSecret: toAddress(roundSecret),
  });

  return toTransactionInstruction(
    instruction as Parameters<typeof toTransactionInstruction>[0]
  );
}
