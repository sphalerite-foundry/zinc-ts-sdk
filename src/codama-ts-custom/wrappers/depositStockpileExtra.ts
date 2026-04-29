import { PublicKey, TransactionInstruction } from "@solana/web3.js";
import { getDepositStockpileExtraInstructionAsync } from "../../codama-ts/instructions";
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

export type BuildDepositStockpileExtraInstruction = {
  admin: PublicKey;
  stockpileId: number | bigint;
  extraMint: PublicKey;
  adminSourceTokenAccount: PublicKey;
  amountRaw: number | bigint;
};

export async function buildDepositStockpileExtraInstruction({
  admin,
  stockpileId,
  extraMint,
  adminSourceTokenAccount,
  amountRaw,
}: BuildDepositStockpileExtraInstruction): Promise<TransactionInstruction> {
  const stockpile = getStockpileAddress(stockpileId)[0];
  const stockpileExtras = getStockpileExtrasAddress()[0];
  const treasury = getTreasuryAddress()[0];
  const stockpileExtraTokenAccount = getClassicAtaAddress(treasury, extraMint);
  const instruction = await getDepositStockpileExtraInstructionAsync({
    admin: toTransactionSigner(admin),
    stockpile: toAddress(stockpile),
    stockpileExtras: toAddress(stockpileExtras),
    treasury: toAddress(treasury),
    extraMint: toAddress(extraMint),
    adminSourceTokenAccount: toAddress(adminSourceTokenAccount),
    stockpileExtraTokenAccount: toAddress(stockpileExtraTokenAccount),
    amountRaw,
  });
  return toTransactionInstruction(
    instruction as Parameters<typeof toTransactionInstruction>[0],
  );
}
