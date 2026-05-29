import { PublicKey, TransactionInstruction } from "@solana/web3.js";
import { getRegisterAffiliateInstructionAsync } from "../../codama-ts";
import { getPlayerProfileAddress } from "../pda";
import {
  toTransactionInstruction,
  toTransactionSigner,
} from "../utils/sol-helpers";
import { toAddress } from "./shared";

export type BuildRegisterAffiliateInstruction = {
  signer: PublicKey;
  affiliate: PublicKey;
};

/** Builds the register-affiliate instruction with signer and affiliate profile PDAs. */
export async function buildRegisterAffiliateInstruction({
  signer,
  affiliate,
}: BuildRegisterAffiliateInstruction): Promise<TransactionInstruction> {
  const playerProfile = getPlayerProfileAddress(signer)[0];
  const affiliateProfile = getPlayerProfileAddress(affiliate)[0];
  const instruction = await getRegisterAffiliateInstructionAsync({
    signer: toTransactionSigner(signer),
    playerProfile: toAddress(playerProfile),
    affiliate: toAddress(affiliate),
    affiliateProfile: toAddress(affiliateProfile),
  });

  return toTransactionInstruction(
    instruction as Parameters<typeof toTransactionInstruction>[0],
  );
}
