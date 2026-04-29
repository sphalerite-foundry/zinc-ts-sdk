import { Connection, PublicKey, TransactionInstruction } from "@solana/web3.js";
import { getClaimStakingYieldInstructionAsync } from "../../codama-ts";
import { fetchTreasuryAccount, getTreasuryAddress } from "../pda";
import {
  toTransactionInstruction,
  toTransactionSigner,
} from "../utils/sol-helpers";
import { toAddress } from "./shared";

export type BuildClaimStakingYieldInstructionInput = {
  /** RPC connection used to resolve the canonical treasury and ZINC mint. */
  connection: Connection;
  /** Wallet that owns the stake position and receives the yield. */
  signer: PublicKey;
};

/** Builds one native staking-yield claim instruction for the active signer. */
export async function buildClaimStakingYieldInstruction(
  input: BuildClaimStakingYieldInstructionInput,
): Promise<TransactionInstruction> {
  const { connection, signer } = input;
  const treasury = getTreasuryAddress()[0];
  const treasuryAccount = await fetchTreasuryAccount(connection, treasury);
  const zincMint = new PublicKey(treasuryAccount.data.zincMint);
  const instruction = await getClaimStakingYieldInstructionAsync({
    signer: toTransactionSigner(signer),
    treasury: toAddress(treasury),
    zincMint: toAddress(zincMint),
  });

  return toTransactionInstruction(
    instruction as Parameters<typeof toTransactionInstruction>[0],
  );
}
