import BN from "bn.js";
import { Buffer } from "buffer";
import {
  getClusterAccAddress,
  getCompDefAccAddress,
  getCompDefAccOffset,
  getComputationAccAddress,
  getExecutingPoolAccAddress,
  getMXEAccAddress,
  getMempoolAccAddress,
} from "@arcium-hq/client";
import { PublicKey, TransactionInstruction } from "@solana/web3.js";
import { getQueueSettleWinningStakesBatchInstructionAsync } from "../../codama-ts/instructions";
import {
  SETTLE_WINNING_STAKES_BATCH_SIZE,
  SETTLE_WINNING_STAKES_BATCH_CIRCUIT,
  ZINC_PROGRAM_ID,
} from "../constants";
import { getRoundAddress, getRoundSecretAddress } from "../pda";
import {
  toAccountMeta,
  toTransactionInstruction,
  toTransactionSigner,
} from "../utils/sol-helpers";
import { resolveArciumClusterOffset, toAddress } from "./shared";

function getSettleWinningStakesBatchCompDefOffset(): number {
  return Buffer.from(
    getCompDefAccOffset(SETTLE_WINNING_STAKES_BATCH_CIRCUIT)
  ).readUInt32LE(0);
}

export type BuildQueueSettleWinningStakesBatchInstruction = {
  signer: PublicKey;
  roundId: number | bigint;
  computationOffset: number | bigint;
  miners: readonly PublicKey[];
  arciumClusterOffset?: number;
};

export async function buildQueueSettleWinningStakesBatchInstruction({
  signer,
  roundId,
  computationOffset,
  miners,
  arciumClusterOffset,
}: BuildQueueSettleWinningStakesBatchInstruction): Promise<TransactionInstruction> {
  if (miners.length === 0) {
    throw new Error("queue settle batch requires at least one miner account");
  }
  if (miners.length > SETTLE_WINNING_STAKES_BATCH_SIZE) {
    throw new Error(
      `queue settle batch supports at most ${SETTLE_WINNING_STAKES_BATCH_SIZE} miner accounts`
    );
  }

  const round = getRoundAddress(roundId)[0];
  const roundSecret = getRoundSecretAddress(roundId)[0];
  const clusterOffset = resolveArciumClusterOffset(arciumClusterOffset);
  const computationOffsetBn = new BN(BigInt(computationOffset).toString());
  const mxeAccount = getMXEAccAddress(ZINC_PROGRAM_ID);
  const mempoolAccount = getMempoolAccAddress(clusterOffset);
  const executingPool = getExecutingPoolAccAddress(clusterOffset);
  const computationAccount = getComputationAccAddress(
    clusterOffset,
    computationOffsetBn
  );
  const compDefAccount = getCompDefAccAddress(
    ZINC_PROGRAM_ID,
    getSettleWinningStakesBatchCompDefOffset()
  );
  const clusterAccount = getClusterAccAddress(clusterOffset);
  const instruction = await getQueueSettleWinningStakesBatchInstructionAsync({
    signer: toTransactionSigner(signer),
    round: toAddress(round),
    roundSecret: toAddress(roundSecret),
    mxeAccount: toAddress(mxeAccount),
    mempoolAccount: toAddress(mempoolAccount),
    executingPool: toAddress(executingPool),
    computationAccount: toAddress(computationAccount),
    compDefAccount: toAddress(compDefAccount),
    clusterAccount: toAddress(clusterAccount),
    computationOffset,
  });
  const transactionInstruction = toTransactionInstruction(
    instruction as Parameters<typeof toTransactionInstruction>[0]
  );
  transactionInstruction.keys.push(
    ...miners.map((miner) => toAccountMeta(miner, true))
  );
  return transactionInstruction;
}
