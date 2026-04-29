import { Connection, PublicKey, TransactionInstruction } from "@solana/web3.js";
import {
  getUpdateZincMintMetadataInstructionAsync,
  type ZincMintMetadataArgsArgs,
} from "../../codama-ts";
import {
  fetchTreasuryAccount,
  getMintMetadataAddress,
  getTreasuryAddress,
} from "../pda";
import {
  toTransactionInstruction,
  toTransactionSigner,
} from "../utils/sol-helpers";
import { toAddress } from "./shared";

export type BuildUpdateZincMintMetadataInstruction = {
  admin: PublicKey;
  connection: Connection;
  metadata: ZincMintMetadataArgsArgs;
};

export async function buildUpdateZincMintMetadataInstruction({
  admin,
  connection,
  metadata,
}: BuildUpdateZincMintMetadataInstruction): Promise<TransactionInstruction> {
  const treasury = getTreasuryAddress()[0];
  const treasuryAccount = await fetchTreasuryAccount(connection, treasury);
  const zincMint = new PublicKey(treasuryAccount.data.zincMint);
  const zincMetadata = getMintMetadataAddress(zincMint)[0];
  const instruction = await getUpdateZincMintMetadataInstructionAsync({
    admin: toTransactionSigner(admin),
    treasury: toAddress(treasury),
    zincMint: toAddress(zincMint),
    zincMetadata: toAddress(zincMetadata),
    args: metadata,
  });
  return toTransactionInstruction(
    instruction as Parameters<typeof toTransactionInstruction>[0],
  );
}
