import { Connection, PublicKey, TransactionInstruction } from "@solana/web3.js";
import { getCloseStockpileInstructionAsync } from "../../codama-ts/instructions";
import {
  fetchTreasuryAccount,
  getStockpileAddress,
  getTreasuryAddress,
} from "../pda";
import {
  toTransactionInstruction,
  toTransactionSigner,
} from "../utils/sol-helpers";
import { toAddress } from "./shared";

export type BuildCloseStockpileInstruction = {
  connection: Connection;
  signer: PublicKey;
  stockpileId: number | bigint;
};

export async function buildCloseStockpileInstruction({
  connection,
  signer,
  stockpileId,
}: BuildCloseStockpileInstruction): Promise<TransactionInstruction> {
  const stockpile = getStockpileAddress(stockpileId)[0];
  const treasury = getTreasuryAddress()[0];
  const treasuryAccount = await fetchTreasuryAccount(connection, treasury);
  const instruction = await getCloseStockpileInstructionAsync({
    signer: toTransactionSigner(signer),
    stockpile: toAddress(stockpile),
    stockpileTokenAccount: treasuryAccount.data.stockpileTokenAccount,
  });
  return toTransactionInstruction(
    instruction as Parameters<typeof toTransactionInstruction>[0],
  );
}
