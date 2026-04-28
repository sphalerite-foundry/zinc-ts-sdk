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
import { Connection, PublicKey, TransactionInstruction } from "@solana/web3.js";
import { getInitRoundInstructionAsync } from "../../codama-ts/instructions";
import { INIT_ROUND_RAND_CIRCUIT, ZINC_PROGRAM_ID } from "../constants";
import {
  fetchBoardAccount,
  getBoardAddress,
  getConfigAddress,
  getRoundAddress,
  getRoundSecretAddress,
  getTreasuryAddress,
} from "../pda";
import {
  toTransactionInstruction,
  toTransactionSigner,
} from "../utils/sol-helpers";
import { resolveArciumClusterOffset, toAddress } from "./shared";

function getInitRoundCompDefOffset(): number {
  return Buffer.from(getCompDefAccOffset(INIT_ROUND_RAND_CIRCUIT)).readUInt32LE(
    0
  );
}

export type BuildInitRoundInstruction = {
  payer: PublicKey;
  connection: Connection;
  computationOffset: number | bigint;
  roundId?: number | bigint;
  arciumClusterOffset?: number;
};

export async function buildInitRoundInstruction({
  payer,
  connection,
  computationOffset,
  roundId,
  arciumClusterOffset,
}: BuildInitRoundInstruction): Promise<TransactionInstruction> {
  const config = getConfigAddress()[0];
  const board = getBoardAddress()[0];
  const treasury = getTreasuryAddress()[0];
  const boardAccount =
    roundId === undefined ? await fetchBoardAccount(connection) : undefined;
  const resolvedRoundId =
    roundId !== undefined ? BigInt(roundId) : boardAccount!.data.nextRoundId;
  const clusterOffset = resolveArciumClusterOffset(arciumClusterOffset);
  const computationOffsetBn = new BN(BigInt(computationOffset).toString());
  const round = getRoundAddress(resolvedRoundId)[0];
  const roundSecret = getRoundSecretAddress(resolvedRoundId)[0];
  const mxeAccount = getMXEAccAddress(ZINC_PROGRAM_ID);
  const mempoolAccount = getMempoolAccAddress(clusterOffset);
  const executingPool = getExecutingPoolAccAddress(clusterOffset);
  const computationAccount = getComputationAccAddress(
    clusterOffset,
    computationOffsetBn
  );
  const compDefAccount = getCompDefAccAddress(
    ZINC_PROGRAM_ID,
    getInitRoundCompDefOffset()
  );
  const clusterAccount = getClusterAccAddress(clusterOffset);
  const instruction = await getInitRoundInstructionAsync({
    payer: toTransactionSigner(payer),
    config: toAddress(config),
    board: toAddress(board),
    treasury: toAddress(treasury),
    round: toAddress(round),
    roundSecret: toAddress(roundSecret),
    mxeAccount: toAddress(mxeAccount),
    mempoolAccount: toAddress(mempoolAccount),
    executingPool: toAddress(executingPool),
    computationAccount: toAddress(computationAccount),
    compDefAccount: toAddress(compDefAccount),
    clusterAccount: toAddress(clusterAccount),
    roundId: resolvedRoundId,
    computationOffset,
  });
  return toTransactionInstruction(
    instruction as Parameters<typeof toTransactionInstruction>[0]
  );
}
