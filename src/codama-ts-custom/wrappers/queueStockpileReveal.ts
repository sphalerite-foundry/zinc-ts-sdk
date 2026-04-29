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
import { getQueueStockpileRevealInstructionAsync } from "../../codama-ts/instructions";
import { REVEAL_STOCKPILE_RAND_CIRCUIT, ZINC_PROGRAM_ID } from "../constants";
import { getStockpileAddress, getStockpileSecretAddress } from "../pda";
import {
  toTransactionInstruction,
  toTransactionSigner,
} from "../utils/sol-helpers";
import { resolveArciumClusterOffset, toAddress } from "./shared";

function getRevealStockpileRandCompDefOffset(): number {
  return Buffer.from(
    getCompDefAccOffset(REVEAL_STOCKPILE_RAND_CIRCUIT),
  ).readUInt32LE(0);
}

export type BuildQueueStockpileRevealInstruction = {
  signer: PublicKey;
  stockpileId: number | bigint;
  computationOffset: number | bigint;
  arciumClusterOffset?: number;
};

export async function buildQueueStockpileRevealInstruction({
  signer,
  stockpileId,
  computationOffset,
  arciumClusterOffset,
}: BuildQueueStockpileRevealInstruction): Promise<TransactionInstruction> {
  const stockpile = getStockpileAddress(stockpileId)[0];
  const stockpileSecret = getStockpileSecretAddress(stockpileId)[0];
  const clusterOffset = resolveArciumClusterOffset(arciumClusterOffset);
  const computationOffsetBn = new BN(BigInt(computationOffset).toString());
  const mxeAccount = getMXEAccAddress(ZINC_PROGRAM_ID);
  const mempoolAccount = getMempoolAccAddress(clusterOffset);
  const executingPool = getExecutingPoolAccAddress(clusterOffset);
  const computationAccount = getComputationAccAddress(
    clusterOffset,
    computationOffsetBn,
  );
  const compDefAccount = getCompDefAccAddress(
    ZINC_PROGRAM_ID,
    getRevealStockpileRandCompDefOffset(),
  );
  const clusterAccount = getClusterAccAddress(clusterOffset);
  const instruction = await getQueueStockpileRevealInstructionAsync({
    signer: toTransactionSigner(signer),
    stockpile: toAddress(stockpile),
    stockpileSecret: toAddress(stockpileSecret),
    mxeAccount: toAddress(mxeAccount),
    mempoolAccount: toAddress(mempoolAccount),
    executingPool: toAddress(executingPool),
    computationAccount: toAddress(computationAccount),
    compDefAccount: toAddress(compDefAccount),
    clusterAccount: toAddress(clusterAccount),
    computationOffset,
  });
  return toTransactionInstruction(
    instruction as Parameters<typeof toTransactionInstruction>[0],
  );
}
