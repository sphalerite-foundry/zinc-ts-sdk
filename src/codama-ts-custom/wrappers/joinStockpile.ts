import { PublicKey, TransactionInstruction } from "@solana/web3.js";
import { getJoinStockpileInstructionAsync } from "../../codama-ts/instructions";
import { getStockpileAddress } from "../pda";
import {
  toTransactionInstruction,
  toTransactionSigner,
} from "../utils/sol-helpers";
import { toAddress } from "./shared";

export type BuildJoinStockpileInstruction = {
  signer: PublicKey;
  stockpileId: number | bigint;
  bricksX10k: number | bigint;
};

export async function buildJoinStockpileInstruction({
  signer,
  stockpileId,
  bricksX10k,
}: BuildJoinStockpileInstruction): Promise<TransactionInstruction> {
  const stockpile = getStockpileAddress(stockpileId)[0];
  const instruction = await getJoinStockpileInstructionAsync({
    signer: toTransactionSigner(signer),
    stockpile: toAddress(stockpile),
    bricksX10k,
  });
  return toTransactionInstruction(
    instruction as Parameters<typeof toTransactionInstruction>[0]
  );
}
