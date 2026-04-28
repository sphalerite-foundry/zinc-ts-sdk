import { Connection, PublicKey, TransactionInstruction } from "@solana/web3.js";
import { getCloseRoundAccountsInstruction } from "../../codama-ts";
import {
  fetchTreasuryAccount,
  getBoardAddress,
  getConfigAddress,
  getRoundAddress,
  getRoundSecretAddress,
  getRoundZincPayoutTokenAccountAddress,
  getTreasuryAddress,
} from "../pda";
import {
  toTransactionInstruction,
  toTransactionSigner,
} from "../utils/sol-helpers";
import { toAddress } from "./shared";

export type BuildCloseRoundAccountsInstruction = {
  /** RPC connection used to resolve the treasury ZINC mint and curve-admin vault. */
  connection: Connection;
  /** Crank signer authorized to submit cleanup transactions. */
  signer: PublicKey;
  /** Round id used to derive the round and default round-secret PDA. */
  roundId: number | bigint;
  /** Explicit round-secret PDA for negative tests or non-standard calls. */
  roundSecret?: PublicKey;
};

/** Builds the parent round and round-secret account close instruction. */
export async function buildCloseRoundAccountsInstruction({
  connection,
  signer,
  roundId,
  roundSecret,
}: BuildCloseRoundAccountsInstruction): Promise<TransactionInstruction> {
  const treasury = getTreasuryAddress()[0];
  const treasuryAccount = await fetchTreasuryAccount(connection, treasury);
  const zincMint = new PublicKey(treasuryAccount.data.zincMint);
  const roundZincPayoutTokenAccount = getRoundZincPayoutTokenAccountAddress(
    roundId,
    treasury,
    zincMint
  )[0];
  const instruction = getCloseRoundAccountsInstruction({
    signer: toTransactionSigner(signer),
    config: toAddress(getConfigAddress()[0]),
    board: toAddress(getBoardAddress()[0]),
    round: toAddress(getRoundAddress(roundId)[0]),
    roundSecret: toAddress(roundSecret ?? getRoundSecretAddress(roundId)[0]),
    treasury: toAddress(treasury),
    zincMint: toAddress(zincMint),
    roundZincPayoutTokenAccount: toAddress(roundZincPayoutTokenAccount),
    curveAdminTokenAccount: treasuryAccount.data.curveAdminTokenAccount,
  });
  return toTransactionInstruction(
    instruction as Parameters<typeof toTransactionInstruction>[0]
  );
}
