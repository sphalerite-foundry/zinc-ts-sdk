import { PublicKey, TransactionInstruction } from "@solana/web3.js";
import { getMigrateInstruction } from "../../codama-ts";
import { getConfigAddress } from "../pda";
import {
  toTransactionInstruction,
  toTransactionSigner,
} from "../utils/sol-helpers";
import { toAddress } from "./shared";

export type BuildMigrateInstruction = {
  admin: PublicKey;
  account: PublicKey;
};

export async function buildMigrateInstruction({
  admin,
  account,
}: BuildMigrateInstruction): Promise<TransactionInstruction> {
  const config = getConfigAddress()[0];
  const instruction = getMigrateInstruction({
    admin: toTransactionSigner(admin),
    config: toAddress(config),
    account: toAddress(account),
  });
  return toTransactionInstruction(
    instruction as Parameters<typeof toTransactionInstruction>[0],
  );
}
