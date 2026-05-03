import { Connection, PublicKey, TransactionInstruction } from "@solana/web3.js";
import {
  getClaimRoundSolInstruction,
  getClaimRoundZincInstructionAsync,
} from "../../codama-ts";
import {
  fetchTreasuryAccount,
  getConfigAddress,
  getRoundZincPayoutTokenAccountAddress,
  getTreasuryAddress,
} from "../pda";
import {
  toTransactionInstruction,
  toTransactionSigner,
} from "../utils/sol-helpers";
import { toAddress } from "./shared";
import { getMinerAddress, getRoundAddress } from "../pda";

const ASSOCIATED_TOKEN_PROGRAM_ID = new PublicKey(
  "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL",
);
const TOKEN_PROGRAM_ID = new PublicKey(
  "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
);

export type BuildClaimRoundInstruction = {
  /** RPC connection used to resolve the treasury mint and round payout vault. */
  connection: Connection;
  signer: PublicKey;
  player: PublicKey;
  roundId: number | bigint;
};

export type BuildClaimRoundSolInstruction = {
  signer: PublicKey;
  player: PublicKey;
  roundId: number | bigint;
};

/** Derives the canonical player ATA that receives optional ZINC stockpile payouts. */
function getPlayerZincTokenAccount(
  player: PublicKey,
  zincMint: PublicKey,
): PublicKey {
  return PublicKey.findProgramAddressSync(
    [player.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), zincMint.toBuffer()],
    ASSOCIATED_TOKEN_PROGRAM_ID,
  )[0];
}

export async function buildClaimRoundZincInstruction({
  connection,
  signer,
  player,
  roundId,
}: BuildClaimRoundInstruction): Promise<TransactionInstruction> {
  const round = getRoundAddress(roundId)[0];
  const miner = getMinerAddress(roundId, player)[0];
  const treasury = getTreasuryAddress()[0];
  const treasuryAccount = await fetchTreasuryAccount(connection, treasury);
  const zincMint = new PublicKey(treasuryAccount.data.zincMint);
  const roundZincPayoutTokenAccount = getRoundZincPayoutTokenAccountAddress(
    roundId,
    treasury,
    zincMint,
  )[0];
  const bonanzaTokenAccount = new PublicKey(
    treasuryAccount.data.bonanzaTokenAccount,
  );
  const playerZincTokenAccount = getPlayerZincTokenAccount(player, zincMint);
  const instruction = await getClaimRoundZincInstructionAsync({
    signer: toTransactionSigner(signer),
    round: toAddress(round),
    config: toAddress(getConfigAddress()[0]),
    miner: toAddress(miner),
    player: toAddress(player),
    treasury: toAddress(treasury),
    zincMint: toAddress(zincMint),
    roundZincPayoutTokenAccount: toAddress(roundZincPayoutTokenAccount),
    bonanzaTokenAccount: toAddress(bonanzaTokenAccount),
    playerZincTokenAccount: toAddress(playerZincTokenAccount),
  });
  return toTransactionInstruction(
    instruction as Parameters<typeof toTransactionInstruction>[0],
  );
}

export function buildClaimRoundSolInstruction({
  signer,
  player,
  roundId,
}: BuildClaimRoundSolInstruction): TransactionInstruction {
  const round = getRoundAddress(roundId)[0];
  const miner = getMinerAddress(roundId, player)[0];
  const instruction = getClaimRoundSolInstruction({
    signer: toTransactionSigner(signer),
    round: toAddress(round),
    miner: toAddress(miner),
    player: toAddress(player),
  });
  return toTransactionInstruction(
    instruction as Parameters<typeof toTransactionInstruction>[0],
  );
}

export const buildClaimRoundInstruction = buildClaimRoundZincInstruction;
