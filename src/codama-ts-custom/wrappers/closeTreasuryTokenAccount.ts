import { PublicKey, TransactionInstruction } from "@solana/web3.js";
import { getCloseTreasuryTokenAccountInstructionAsync } from "../../codama-ts";
import { getConfigAddress, getTreasuryAddress } from "../pda";
import {
  toTransactionInstruction,
  toTransactionSigner,
} from "../utils/sol-helpers";
import { getClassicAtaAddress, toAddress } from "./shared";

export type BuildCloseTreasuryTokenAccountInstruction = {
  /** Admin signer that receives drained tokens and closed-account rent. */
  admin: PublicKey;
  /** Mint stored on the treasury-owned source token account. */
  mint: PublicKey;
  /** Treasury-owned token account to drain and close. */
  sourceTokenAccount: PublicKey;
  /** Optional admin ATA override for inspection and tests. */
  adminTokenAccount?: PublicKey;
  /** Program ID used to derive Zinc PDAs. */
  programId?: PublicKey;
};

/** Builds the admin-only close instruction; canonical ZINC also returns mint authority to admin. */
export async function buildCloseTreasuryTokenAccountInstruction({
  admin,
  mint,
  sourceTokenAccount,
  adminTokenAccount,
  programId,
}: BuildCloseTreasuryTokenAccountInstruction): Promise<TransactionInstruction> {
  const config = getConfigAddress(programId)[0];
  const treasury = getTreasuryAddress(programId)[0];
  const resolvedAdminTokenAccount =
    adminTokenAccount ?? getClassicAtaAddress(admin, mint);
  const instruction = await getCloseTreasuryTokenAccountInstructionAsync({
    admin: toTransactionSigner(admin),
    config: toAddress(config),
    treasury: toAddress(treasury),
    mint: toAddress(mint),
    sourceTokenAccount: toAddress(sourceTokenAccount),
    adminTokenAccount: toAddress(resolvedAdminTokenAccount),
  });

  return toTransactionInstruction(
    instruction as Parameters<typeof toTransactionInstruction>[0],
  );
}
