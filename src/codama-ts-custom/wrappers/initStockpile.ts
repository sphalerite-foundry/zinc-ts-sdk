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
import { getInitStockpileInstructionAsync } from "../../codama-ts/instructions";
import { INIT_STOCKPILE_RAND_CIRCUIT, ZINC_PROGRAM_ID } from "../constants";
import {
  fetchBoardAccount,
  fetchTreasuryAccount,
  getStockpileAddress,
  getStockpileExtrasAddress,
  getStockpileSecretAddress,
  getStockpileSolVaultAddress,
  getStockpileWinnersAddress,
  getTreasuryAddress,
} from "../pda";
import {
  toTransactionInstruction,
  toTransactionSigner,
} from "../utils/sol-helpers";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  resolveArciumClusterOffset,
  toAddress,
} from "./shared";

function getInitStockpileRandCompDefOffset(): number {
  return Buffer.from(
    getCompDefAccOffset(INIT_STOCKPILE_RAND_CIRCUIT),
  ).readUInt32LE(0);
}

export type BuildInitStockpileInstruction = {
  payer: PublicKey;
  connection: Connection;
  computationOffset: number | bigint;
  stockpileId?: number | bigint;
  arciumClusterOffset?: number;
};

export async function buildInitStockpileInstruction({
  payer,
  connection,
  computationOffset,
  stockpileId,
  arciumClusterOffset,
}: BuildInitStockpileInstruction): Promise<TransactionInstruction> {
  const boardAccount =
    stockpileId === undefined ? await fetchBoardAccount(connection) : undefined;
  const resolvedStockpileId =
    stockpileId !== undefined
      ? BigInt(stockpileId)
      : boardAccount!.data.nextStockpileId;
  const clusterOffset = resolveArciumClusterOffset(arciumClusterOffset);
  const computationOffsetBn = new BN(BigInt(computationOffset).toString());
  const treasury = getTreasuryAddress()[0];
  const treasuryAccount = await fetchTreasuryAccount(connection, treasury);
  const stockpile = getStockpileAddress(resolvedStockpileId)[0];
  const stockpileSecret = getStockpileSecretAddress(resolvedStockpileId)[0];
  const stockpileWinners = getStockpileWinnersAddress(resolvedStockpileId)[0];
  const stockpileExtras = getStockpileExtrasAddress()[0];
  const mxeAccount = getMXEAccAddress(ZINC_PROGRAM_ID);
  const mempoolAccount = getMempoolAccAddress(clusterOffset);
  const executingPool = getExecutingPoolAccAddress(clusterOffset);
  const computationAccount = getComputationAccAddress(
    clusterOffset,
    computationOffsetBn,
  );
  const compDefAccount = getCompDefAccAddress(
    ZINC_PROGRAM_ID,
    getInitStockpileRandCompDefOffset(),
  );
  const clusterAccount = getClusterAccAddress(clusterOffset);
  const instruction = await getInitStockpileInstructionAsync({
    payer: toTransactionSigner(payer),
    treasury: toAddress(treasury),
    zincMint: treasuryAccount.data.zincMint,
    stockpile: toAddress(stockpile),
    stockpileSecret: toAddress(stockpileSecret),
    stockpileWinners: toAddress(stockpileWinners),
    stockpileExtras: toAddress(stockpileExtras),
    mxeAccount: toAddress(mxeAccount),
    mempoolAccount: toAddress(mempoolAccount),
    executingPool: toAddress(executingPool),
    computationAccount: toAddress(computationAccount),
    compDefAccount: toAddress(compDefAccount),
    clusterAccount: toAddress(clusterAccount),
    stockpileSolVault: toAddress(getStockpileSolVaultAddress()[0]),
    stockpileTokenAccount: treasuryAccount.data.stockpileTokenAccount,
    computationOffset,
  });
  const transactionInstruction = toTransactionInstruction(
    instruction as Parameters<typeof toTransactionInstruction>[0],
  );
  if (
    !transactionInstruction.keys.some(({ pubkey }) =>
      pubkey.equals(ASSOCIATED_TOKEN_PROGRAM_ID),
    )
  ) {
    transactionInstruction.keys.push({
      pubkey: ASSOCIATED_TOKEN_PROGRAM_ID,
      isSigner: false,
      isWritable: false,
    });
  }
  return transactionInstruction;
}
