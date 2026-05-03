import { PublicKey, TransactionInstruction } from "@solana/web3.js";
import { getAssociatedTokenAddressSync } from "@solana/spl-token";
import { getJoinStockpileInstructionAsync } from "../../codama-ts/instructions";
import {
  getStakingRewardTokenAccountAddress,
  getStockpileAddress,
  getStockpileTokenAccountAddress,
  getTreasuryAddress,
} from "../pda";
import {
  toTransactionInstruction,
  toTransactionSigner,
} from "../utils/sol-helpers";
import { toAddress } from "./shared";

export type BuildJoinStockpileInstruction = {
  signer: PublicKey;
  stockpileId: number | bigint;
  zincMint: PublicKey;
  stockpileTokenAccount?: PublicKey;
  signerZincTokenAccount?: PublicKey;
  bricksX10k: number | bigint;
};

export async function buildJoinStockpileInstruction({
  signer,
  stockpileId,
  zincMint,
  stockpileTokenAccount = getStockpileTokenAccountAddress()[0],
  signerZincTokenAccount = getAssociatedTokenAddressSync(
    zincMint,
    signer,
    true,
  ),
  bricksX10k,
}: BuildJoinStockpileInstruction): Promise<TransactionInstruction> {
  const stockpile = getStockpileAddress(stockpileId)[0];
  const instruction = await getJoinStockpileInstructionAsync({
    signer: toTransactionSigner(signer),
    stockpile: toAddress(stockpile),
    treasury: toAddress(getTreasuryAddress()[0]),
    zincMint: toAddress(zincMint),
    stockpileTokenAccount: toAddress(stockpileTokenAccount),
    signerZincTokenAccount: toAddress(signerZincTokenAccount),
    stakingRewardTokenAccount: toAddress(
      getStakingRewardTokenAccountAddress()[0],
    ),
    bricksX10k,
  });
  return toTransactionInstruction(
    instruction as Parameters<typeof toTransactionInstruction>[0],
  );
}
