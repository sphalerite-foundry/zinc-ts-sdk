import { PublicKey, TransactionInstruction } from "@solana/web3.js";
import { getWithdrawTreasuryFeesInstructionAsync } from "../../codama-ts";
import { getConfigAddress, getTreasuryAddress } from "../pda";
import {
  toTransactionInstruction,
  toTransactionSigner,
} from "../utils/sol-helpers";
import { getClassicAtaAddress, toAddress } from "./shared";

export type BuildWithdrawTreasuryFeesInstruction = {
  /** Admin signer that receives the swept SOL and ZINC. */
  admin: PublicKey;
  /** Protocol ZINC mint routed through the curve-admin fee vault. */
  zincMint: PublicKey;
  /** Optional admin ATA override for inspection and tests. */
  adminTokenAccount?: PublicKey;
  /** Program ID used to derive Zinc PDAs. */
  programId?: PublicKey;
};

/** Builds the admin-only instruction that sweeps treasury SOL surplus and curve-admin ZINC. */
export async function buildWithdrawTreasuryFeesInstruction({
  admin,
  zincMint,
  adminTokenAccount,
  programId,
}: BuildWithdrawTreasuryFeesInstruction): Promise<TransactionInstruction> {
  const config = getConfigAddress(programId)[0];
  const treasury = getTreasuryAddress(programId)[0];
  const resolvedAdminTokenAccount =
    adminTokenAccount ?? getClassicAtaAddress(admin, zincMint);
  const instruction = await getWithdrawTreasuryFeesInstructionAsync({
    admin: toTransactionSigner(admin),
    config: toAddress(config),
    treasury: toAddress(treasury),
    zincMint: toAddress(zincMint),
    curveAdminTokenAccount: toAddress(getClassicAtaAddress(treasury, zincMint)),
    adminTokenAccount: toAddress(resolvedAdminTokenAccount),
  });

  return toTransactionInstruction(
    instruction as Parameters<typeof toTransactionInstruction>[0]
  );
}
