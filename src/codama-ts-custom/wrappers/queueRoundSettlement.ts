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
import { getQueueRoundSettlementInstructionAsync } from "../../codama-ts/instructions";
import { REVEAL_ROUND_RAND_CIRCUIT, ZINC_PROGRAM_ID } from "../constants";
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
import { resolveArciumClusterOffset, toAddress } from "./shared";

function getRevealRoundRandCompDefOffset(): number {
  return Buffer.from(
    getCompDefAccOffset(REVEAL_ROUND_RAND_CIRCUIT)
  ).readUInt32LE(0);
}

export type BuildQueueRoundSettlementInstruction = {
  signer: PublicKey;
  roundId: number | bigint;
  computationOffset: number | bigint;
  arciumClusterOffset?: number;
};

export async function buildQueueRoundSettlementInstruction({
  signer,
  roundId,
  computationOffset,
  arciumClusterOffset,
}: BuildQueueRoundSettlementInstruction): Promise<TransactionInstruction> {
  const config = getConfigAddress()[0];
  const board = getBoardAddress()[0];
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
    getRevealRoundRandCompDefOffset()
  );
  const clusterAccount = getClusterAccAddress(clusterOffset);
  const instruction = await getQueueRoundSettlementInstructionAsync({
    signer: toTransactionSigner(signer),
    config: toAddress(config),
    board: toAddress(board),
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
  return toTransactionInstruction(
    instruction as Parameters<typeof toTransactionInstruction>[0]
  );
}
