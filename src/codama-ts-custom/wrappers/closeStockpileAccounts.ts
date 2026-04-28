import { PublicKey, TransactionInstruction } from "@solana/web3.js";
import { getCloseStockpileAccountsInstruction } from "../../codama-ts";
import {
  getBoardAddress,
  getConfigAddress,
  getStockpileAddress,
  getStockpileSecretAddress,
} from "../pda";
import {
  toTransactionInstruction,
  toTransactionSigner,
} from "../utils/sol-helpers";
import { toAddress } from "./shared";

export type BuildCloseStockpileAccountsInstruction = {
  /** Crank signer authorized to submit cleanup transactions. */
  signer: PublicKey;
  /** Stockpile id used to derive the stockpile and default stockpile-secret PDA. */
  stockpileId: number | bigint;
  /** Explicit stockpile-secret PDA for negative tests or non-standard calls. */
  stockpileSecret?: PublicKey;
};

/** Builds the stockpile and stockpile-secret account close instruction. */
export function buildCloseStockpileAccountsInstruction({
  signer,
  stockpileId,
  stockpileSecret,
}: BuildCloseStockpileAccountsInstruction): TransactionInstruction {
  const instruction = getCloseStockpileAccountsInstruction({
    signer: toTransactionSigner(signer),
    config: toAddress(getConfigAddress()[0]),
    board: toAddress(getBoardAddress()[0]),
    stockpile: toAddress(getStockpileAddress(stockpileId)[0]),
    stockpileSecret: toAddress(
      stockpileSecret ?? getStockpileSecretAddress(stockpileId)[0]
    ),
  });
  return toTransactionInstruction(
    instruction as Parameters<typeof toTransactionInstruction>[0]
  );
}
