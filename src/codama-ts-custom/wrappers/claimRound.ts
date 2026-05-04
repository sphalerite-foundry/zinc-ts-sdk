import { Connection, PublicKey, TransactionInstruction } from "@solana/web3.js";
import {
  getClaimPlayerSolRewardsInstructionAsync,
  getClaimPlayerZincRewardsInstructionAsync,
  getClaimRoundSolInstruction,
  getCreditRoundRewardsInstructionAsync,
} from "../../codama-ts";
import {
  fetchTreasuryAccount,
  getConfigAddress,
  getPlayerProfileAddress,
  getRoundZincRewardTokenAccountAddress,
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
  /** Player signer submitting the aggregate ZINC reward claim transaction. */
  signer: PublicKey;
  /** Deprecated round id accepted for old call sites; aggregate reward claims are not per-round. */
  roundId?: number | bigint;
};

export type BuildCreditRoundRewardsInstruction = {
  /** RPC connection used to resolve the treasury mint and reward vaults. */
  connection: Connection;
  /** Crank signer submitting the automatic reward credit transaction. */
  signer: PublicKey;
  /** Player whose settled round rewards are credited. */
  player: PublicKey;
  roundId: number | bigint;
};

export type BuildClaimRoundSolInstruction = {
  signer: PublicKey;
  player: PublicKey;
  roundId: number | bigint;
};

export type BuildClaimPlayerSolRewardsInstruction = {
  signer: PublicKey;
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

export async function buildCreditRoundRewardsInstruction({
  connection,
  signer,
  player,
  roundId,
}: BuildCreditRoundRewardsInstruction): Promise<TransactionInstruction> {
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
  const roundZincRewardTokenAccount = new PublicKey(
    treasuryAccount.data.roundZincRewardTokenAccount,
  );
  const instruction = await getCreditRoundRewardsInstructionAsync({
    signer: toTransactionSigner(signer),
    config: toAddress(getConfigAddress()[0]),
    round: toAddress(round),
    miner: toAddress(miner),
    playerProfile: toAddress(getPlayerProfileAddress(player)[0]),
    treasury: toAddress(treasury),
    zincMint: toAddress(zincMint),
    roundZincPayoutTokenAccount: toAddress(roundZincPayoutTokenAccount),
    bonanzaTokenAccount: toAddress(bonanzaTokenAccount),
    roundZincRewardTokenAccount: toAddress(roundZincRewardTokenAccount),
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
    config: toAddress(getConfigAddress()[0]),
    round: toAddress(round),
    miner: toAddress(miner),
    player: toAddress(player),
  });
  return toTransactionInstruction(
    instruction as Parameters<typeof toTransactionInstruction>[0],
  );
}

export async function buildClaimPlayerSolRewardsInstruction({
  signer,
}: BuildClaimPlayerSolRewardsInstruction): Promise<TransactionInstruction> {
  const instruction = await getClaimPlayerSolRewardsInstructionAsync({
    signer: toTransactionSigner(signer),
    playerProfile: toAddress(getPlayerProfileAddress(signer)[0]),
  });
  return toTransactionInstruction(
    instruction as Parameters<typeof toTransactionInstruction>[0],
  );
}

export async function buildClaimPlayerZincRewardsInstruction({
  connection,
  signer,
}: BuildClaimRoundInstruction): Promise<TransactionInstruction> {
  const treasury = getTreasuryAddress()[0];
  const treasuryAccount = await fetchTreasuryAccount(connection, treasury);
  const zincMint = new PublicKey(treasuryAccount.data.zincMint);
  const signerZincTokenAccount = getPlayerZincTokenAccount(signer, zincMint);
  const instruction = await getClaimPlayerZincRewardsInstructionAsync({
    signer: toTransactionSigner(signer),
    config: toAddress(getConfigAddress()[0]),
    treasury: toAddress(treasury),
    zincMint: toAddress(zincMint),
    playerProfile: toAddress(getPlayerProfileAddress(signer)[0]),
    roundZincRewardTokenAccount: toAddress(
      getRoundZincRewardTokenAccountAddress()[0],
    ),
    signerZincTokenAccount: toAddress(signerZincTokenAccount),
  });
  return toTransactionInstruction(
    instruction as Parameters<typeof toTransactionInstruction>[0],
  );
}

export const buildClaimRoundInstruction =
  buildClaimPlayerZincRewardsInstruction;
