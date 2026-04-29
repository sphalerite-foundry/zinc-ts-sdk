import { PublicKey, TransactionInstruction } from "@solana/web3.js";
import { getCloseConfigInstructionAsync } from "../../codama-ts";
import { getConfigAddress } from "../pda";
import {
  toTransactionInstruction,
  toTransactionSigner,
} from "../utils/sol-helpers";
import { toAddress } from "./shared";

export type BuildCloseConfigInstruction = {
  admin: PublicKey;
};

/** Builds the admin-only instruction that closes the singleton config PDA. */
export async function buildCloseConfigInstruction({
  admin,
}: BuildCloseConfigInstruction): Promise<TransactionInstruction> {
  const config = getConfigAddress()[0];
  const instruction = await getCloseConfigInstructionAsync({
    admin: toTransactionSigner(admin),
    config: toAddress(config),
  });

  return toTransactionInstruction(
    instruction as Parameters<typeof toTransactionInstruction>[0],
  );
}
