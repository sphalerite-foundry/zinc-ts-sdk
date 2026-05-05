import { type ReadonlyUint8Array } from "@solana/kit";
import { PublicKey, TransactionInstruction } from "@solana/web3.js";
import {
  getCancelAutoMinerSessionInstructionAsync,
  getInitAutoMinerSessionInstructionAsync,
  getTopUpAutoMinerSessionInstructionAsync,
  getUpdateAutoMinerSessionInstructionAsync,
} from "../../codama-ts";
import {
  toTransactionInstruction,
  toTransactionSigner,
} from "../utils/sol-helpers";
import { toAddress } from "./shared";

type AutoMinerEncryptedPatternInput = {
  /** Ephemeral public key used to encrypt the tile-pattern bits to the crank. */
  maskBitsEncryptionKey: ReadonlyUint8Array;
  /** Rescue CTR nonce used for the encrypted tile-pattern bits. */
  maskBitsNonce: number | bigint;
  /** Encrypted tile-pattern bits readable only by the configured crank. */
  maskBitsCiphertext: ReadonlyUint8Array;
  /** Crank encryption-key version stored beside the ciphertext. */
  maskBitsKeyVersion: number;
};

export type BuildInitAutoMinerSessionInstruction =
  AutoMinerEncryptedPatternInput & {
    /** Wallet that owns and funds the auto-miner session. */
    signer: PublicKey;
    /** Crank wallet allowed to execute auto deploys. */
    executor: PublicKey;
    /** Gross lamports to deploy into each eligible round. */
    amountPerRound: number | bigint;
    /** Initial user-funded spendable budget. */
    initialBudget: number | bigint;
    /** Maximum number of auto deploys allowed by this session. */
    maxRounds: number | bigint;
    /** Optional last slot at which the session can still deploy. */
    expirySlot?: number | bigint | null;
    /** Fixed lamport reimbursement paid to the crank after a successful deploy. */
    crankReimbursementLamports: number | bigint;
  };

export type BuildUpdateAutoMinerSessionInstruction =
  AutoMinerEncryptedPatternInput & {
    /** Wallet that owns and controls the session. */
    signer: PublicKey;
    /** Crank wallet allowed to execute auto deploys. */
    executor: PublicKey;
    /** Gross lamports to deploy into each eligible round. */
    amountPerRound: number | bigint;
    /** Maximum number of auto deploys allowed by this session. */
    maxRounds: number | bigint;
    /** Optional last slot at which the session can still deploy. */
    expirySlot?: number | bigint | null;
    /** Whether the authority paused auto execution. */
    paused: boolean;
    /** Fixed lamport reimbursement paid to the crank after a successful deploy. */
    crankReimbursementLamports: number | bigint;
  };

export type BuildTopUpAutoMinerSessionInstruction = {
  /** Wallet that owns and funds the session. */
  signer: PublicKey;
  /** Lamports to add to the spendable auto-miner budget. */
  amount: number | bigint;
};

export type BuildCancelAutoMinerSessionInstruction = {
  /** Wallet that owns and cancels the session. */
  signer: PublicKey;
};

/** Builds the instruction that creates a player-owned auto-miner session. */
export async function buildInitAutoMinerSessionInstruction({
  signer,
  executor,
  amountPerRound,
  maskBitsEncryptionKey,
  maskBitsNonce,
  maskBitsCiphertext,
  maskBitsKeyVersion,
  initialBudget,
  maxRounds,
  expirySlot = null,
  crankReimbursementLamports,
}: BuildInitAutoMinerSessionInstruction): Promise<TransactionInstruction> {
  const instruction = await getInitAutoMinerSessionInstructionAsync({
    authority: toTransactionSigner(signer),
    executor: toAddress(executor),
    amountPerRound,
    maskBitsEncryptionKey,
    maskBitsNonce,
    maskBitsCiphertext,
    maskBitsKeyVersion,
    initialBudget,
    maxRounds,
    expirySlot,
    crankReimbursementLamports,
  });
  return toTransactionInstruction(
    instruction as Parameters<typeof toTransactionInstruction>[0],
  );
}

/** Builds the instruction that updates authority-controlled auto-miner settings. */
export async function buildUpdateAutoMinerSessionInstruction({
  signer,
  executor,
  amountPerRound,
  maskBitsEncryptionKey,
  maskBitsNonce,
  maskBitsCiphertext,
  maskBitsKeyVersion,
  maxRounds,
  expirySlot = null,
  paused,
  crankReimbursementLamports,
}: BuildUpdateAutoMinerSessionInstruction): Promise<TransactionInstruction> {
  const instruction = await getUpdateAutoMinerSessionInstructionAsync({
    authority: toTransactionSigner(signer),
    executor: toAddress(executor),
    amountPerRound,
    maskBitsEncryptionKey,
    maskBitsNonce,
    maskBitsCiphertext,
    maskBitsKeyVersion,
    maxRounds,
    expirySlot,
    paused,
    crankReimbursementLamports,
  });
  return toTransactionInstruction(
    instruction as Parameters<typeof toTransactionInstruction>[0],
  );
}

/** Builds the instruction that adds SOL budget to an existing auto-miner session. */
export async function buildTopUpAutoMinerSessionInstruction({
  signer,
  amount,
}: BuildTopUpAutoMinerSessionInstruction): Promise<TransactionInstruction> {
  const instruction = await getTopUpAutoMinerSessionInstructionAsync({
    authority: toTransactionSigner(signer),
    amount,
  });
  return toTransactionInstruction(
    instruction as Parameters<typeof toTransactionInstruction>[0],
  );
}

/** Builds the instruction that cancels and refunds an existing auto-miner session. */
export async function buildCancelAutoMinerSessionInstruction({
  signer,
}: BuildCancelAutoMinerSessionInstruction): Promise<TransactionInstruction> {
  const instruction = await getCancelAutoMinerSessionInstructionAsync({
    authority: toTransactionSigner(signer),
  });
  return toTransactionInstruction(
    instruction as Parameters<typeof toTransactionInstruction>[0],
  );
}
