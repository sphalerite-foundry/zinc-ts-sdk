import { PublicKey, TransactionInstruction } from "@solana/web3.js";
import { getInitStockpileWinnersInstructionAsync } from "../../codama-ts/instructions";
import { getStockpileAddress, getStockpileWinnersAddress } from "../pda";
import {
  toTransactionInstruction,
  toTransactionSigner,
} from "../utils/sol-helpers";
import { toAddress } from "./shared";

export type BuildInitStockpileWinnersInstruction = {
  payer: PublicKey;
  stockpileId: number | bigint;
};

export async function buildInitStockpileWinnersInstruction({
  payer,
  stockpileId,
}: BuildInitStockpileWinnersInstruction): Promise<TransactionInstruction> {
  const stockpile = getStockpileAddress(stockpileId)[0];
  const stockpileWinners = getStockpileWinnersAddress(stockpileId)[0];
  const instruction = await getInitStockpileWinnersInstructionAsync({
    payer: toTransactionSigner(payer),
    stockpile: toAddress(stockpile),
    stockpileWinners: toAddress(stockpileWinners),
  });
  return toTransactionInstruction(
    instruction as Parameters<typeof toTransactionInstruction>[0],
  );
}
