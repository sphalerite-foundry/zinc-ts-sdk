import { Connection, PublicKey, TransactionInstruction } from "@solana/web3.js";
import { getUnstakeInstructionAsync } from "../../codama-ts";
import { fetchTreasuryAccount, getTreasuryAddress } from "../pda";
import {
  toTransactionInstruction,
  toTransactionSigner,
} from "../utils/sol-helpers";
import { toAddress } from "./shared";

export type BuildUnstakeInstructionInput = {
  /** RPC connection used to resolve the canonical treasury and ZINC mint. */
  connection: Connection;
  /** Wallet that owns the stake position. */
  signer: PublicKey;
  /** Raw ZINC amount in mint base units. */
  amount: bigint;
};

/** Builds one native ZINC unstake instruction for the active signer. */
export async function buildUnstakeInstruction(
  input: BuildUnstakeInstructionInput
): Promise<TransactionInstruction> {
  const { connection, signer, amount } = input;
  const treasury = getTreasuryAddress()[0];
  const treasuryAccount = await fetchTreasuryAccount(connection, treasury);
  const zincMint = new PublicKey(treasuryAccount.data.zincMint);
  const instruction = await getUnstakeInstructionAsync({
    signer: toTransactionSigner(signer),
    treasury: toAddress(treasury),
    zincMint: toAddress(zincMint),
    amount,
  });

  return toTransactionInstruction(
    instruction as Parameters<typeof toTransactionInstruction>[0]
  );
}
