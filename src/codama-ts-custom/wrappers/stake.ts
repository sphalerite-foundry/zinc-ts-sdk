import { Connection, PublicKey, TransactionInstruction } from "@solana/web3.js";
import { getStakeInstructionAsync } from "../../codama-ts";
import { fetchTreasuryAccount, getTreasuryAddress } from "../pda";
import {
  toTransactionInstruction,
  toTransactionSigner,
} from "../utils/sol-helpers";
import { toAddress } from "./shared";

export type BuildStakeInstructionInput = {
  /** RPC connection used to resolve the canonical treasury and ZINC mint. */
  connection: Connection;
  /** Wallet that funds the staking deposit. */
  signer: PublicKey;
  /** Raw ZINC amount in mint base units. */
  amount: bigint;
};

/** Builds one native ZINC staking instruction for the active signer. */
export async function buildStakeInstruction(
  input: BuildStakeInstructionInput,
): Promise<TransactionInstruction> {
  const { connection, signer, amount } = input;
  const treasury = getTreasuryAddress()[0];
  const treasuryAccount = await fetchTreasuryAccount(connection, treasury);
  const zincMint = new PublicKey(treasuryAccount.data.zincMint);
  const instruction = await getStakeInstructionAsync({
    signer: toTransactionSigner(signer),
    treasury: toAddress(treasury),
    zincMint: toAddress(zincMint),
    amount,
  });

  return toTransactionInstruction(
    instruction as Parameters<typeof toTransactionInstruction>[0],
  );
}
