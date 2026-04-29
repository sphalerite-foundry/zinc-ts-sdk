import { PublicKey, TransactionInstruction } from "@solana/web3.js";
import { createSyncNativeInstruction } from "@solana/spl-token";
import { getWrapBuybackSolInstructionAsync } from "../../codama-ts";
import { WSOL_MINT_ADDRESS } from "../constants";
import {
  getBuybackSolVaultAddress,
  getConfigAddress,
  getTreasuryAddress,
} from "../pda";
import {
  toTransactionInstruction,
  toTransactionSigner,
} from "../utils/sol-helpers";
import { getClassicAtaAddress, toAddress } from "./shared";

export type BuildWrapBuybackSolInstruction = {
  signer: PublicKey;
  amount: number | bigint;
};

/** Builds the Zinc instruction that moves buyback SOL into treasury-owned WSOL custody. */
export async function buildWrapBuybackSolInstruction({
  signer,
  amount,
}: BuildWrapBuybackSolInstruction): Promise<TransactionInstruction> {
  const config = getConfigAddress()[0];
  const treasury = getTreasuryAddress()[0];
  const buybackSolVault = getBuybackSolVaultAddress()[0];
  const treasuryWsolTokenAccount = getClassicAtaAddress(
    treasury,
    WSOL_MINT_ADDRESS,
  );
  const instruction = await getWrapBuybackSolInstructionAsync({
    signer: toTransactionSigner(signer),
    config: toAddress(config),
    treasury: toAddress(treasury),
    buybackSolVault: toAddress(buybackSolVault),
    wsolMint: toAddress(WSOL_MINT_ADDRESS),
    treasuryWsolTokenAccount: toAddress(treasuryWsolTokenAccount),
    amount,
  });

  return toTransactionInstruction(
    instruction as Parameters<typeof toTransactionInstruction>[0],
  );
}

/** Builds the full top-level instruction pair required to wrap and sync buyback SOL. */
export async function buildWrapBuybackSolInstructions(
  input: BuildWrapBuybackSolInstruction,
): Promise<TransactionInstruction[]> {
  const treasury = getTreasuryAddress()[0];
  const treasuryWsolTokenAccount = getClassicAtaAddress(
    treasury,
    WSOL_MINT_ADDRESS,
  );
  const wrapInstruction = await buildWrapBuybackSolInstruction(input);
  const syncNativeInstruction = createSyncNativeInstruction(
    treasuryWsolTokenAccount,
  );

  return [wrapInstruction, syncNativeInstruction];
}
