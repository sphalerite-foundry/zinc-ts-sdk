import { PublicKey, TransactionInstruction } from "@solana/web3.js";
import { getClaimAffiliateInstructionAsync } from "../../codama-ts";
import { getConfigAddress, getPlayerProfileAddress } from "../pda";
import {
  toTransactionInstruction,
  toTransactionSigner,
} from "../utils/sol-helpers";
import { toAddress } from "./shared";

export type BuildClaimAffiliateInstruction = {
  signer: PublicKey;
};

/** Builds the claim-affiliate instruction with the signer's player-profile PDA. */
export async function buildClaimAffiliateInstruction({
  signer,
}: BuildClaimAffiliateInstruction): Promise<TransactionInstruction> {
  const playerProfile = getPlayerProfileAddress(signer)[0];
  const config = getConfigAddress()[0];
  const instruction = await getClaimAffiliateInstructionAsync({
    signer: toTransactionSigner(signer),
    config: toAddress(config),
    playerProfile: toAddress(playerProfile),
  });

  return toTransactionInstruction(
    instruction as Parameters<typeof toTransactionInstruction>[0]
  );
}
