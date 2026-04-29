import { PublicKey, TransactionInstruction } from "@solana/web3.js";
import { getPayoutStockpileExtraInstructionAsync } from "../../codama-ts/instructions";
import {
  getStockpileAddress,
  getStockpileExtrasAddress,
  getTreasuryAddress,
} from "../pda";
import {
  toTransactionInstruction,
  toTransactionSigner,
} from "../utils/sol-helpers";
import { getClassicAtaAddress, toAddress } from "./shared";

export type BuildPayoutStockpileExtraInstruction = {
  signer: PublicKey;
  stockpileId: number | bigint;
  winner: PublicKey;
  extraMint: PublicKey;
  extraIndex: number;
};

export async function buildPayoutStockpileExtraInstruction({
  signer,
  stockpileId,
  winner,
  extraMint,
  extraIndex,
}: BuildPayoutStockpileExtraInstruction): Promise<TransactionInstruction> {
  const stockpile = getStockpileAddress(stockpileId)[0];
  const stockpileExtras = getStockpileExtrasAddress()[0];
  const treasury = getTreasuryAddress()[0];
  const stockpileExtraTokenAccount = getClassicAtaAddress(treasury, extraMint);
  const winnerExtraTokenAccount = getClassicAtaAddress(winner, extraMint);
  const instruction = await getPayoutStockpileExtraInstructionAsync({
    signer: toTransactionSigner(signer),
    stockpile: toAddress(stockpile),
    stockpileExtras: toAddress(stockpileExtras),
    treasury: toAddress(treasury),
    extraMint: toAddress(extraMint),
    stockpileExtraTokenAccount: toAddress(stockpileExtraTokenAccount),
    winner: toAddress(winner),
    winnerExtraTokenAccount: toAddress(winnerExtraTokenAccount),
    extraIndex,
  });
  return toTransactionInstruction(
    instruction as Parameters<typeof toTransactionInstruction>[0],
  );
}
