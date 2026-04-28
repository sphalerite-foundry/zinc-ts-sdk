import { PublicKey, TransactionInstruction } from "@solana/web3.js";
import {
  getInitConfigInstructionAsync,
  type ZincMintMetadataArgsArgs,
} from "../../codama-ts";
import {
  getConfigAddress,
  getStockpileExtrasAddress,
  getMintMetadataAddress,
  getTreasuryAddress,
} from "../pda";
import {
  toTransactionInstruction,
  toTransactionSigner,
} from "../utils/sol-helpers";
import { toAddress } from "./shared";

export type BuildInitConfigInstruction = {
  admin: PublicKey;
  crank: PublicKey;
  zincMint: PublicKey;
  metadata: ZincMintMetadataArgsArgs;
};

export async function buildInitConfigInstruction({
  admin,
  crank,
  zincMint,
  metadata,
}: BuildInitConfigInstruction): Promise<TransactionInstruction> {
  const treasury = getTreasuryAddress()[0];
  const config = getConfigAddress()[0];
  const zincMetadata = getMintMetadataAddress(zincMint)[0];
  const instruction = await getInitConfigInstructionAsync({
    admin: toTransactionSigner(admin),
    crank: toAddress(crank),
    config: toAddress(config),
    treasury: toAddress(treasury),
    zincMint: toTransactionSigner(zincMint),
    zincMetadata: toAddress(zincMetadata),
    stockpileExtras: toAddress(getStockpileExtrasAddress()[0]),
    args: metadata,
  });
  const transactionInstruction = toTransactionInstruction(
    instruction as Parameters<typeof toTransactionInstruction>[0]
  );
  return transactionInstruction;
}
