import {
  address,
  type Address,
  type ReadonlyUint8Array,
  type TransactionSigner,
} from "@solana/kit";
import { Buffer } from "buffer";
import {
  type AccountMeta,
  type AddressLookupTableAccount,
  type BlockheightBasedTransactionConfirmationStrategy,
  ComputeBudgetProgram,
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  TransactionInstruction,
  TransactionMessage,
  type SignatureResult,
  VersionedTransaction,
} from "@solana/web3.js";

export type TxnResult = {
  Signature: string;
  SignatureResult: SignatureResult;
};

export type PriorityFeeTier = "urgent" | "background";

export type ComputeBudgetOptions = {
  priorityFeeTier?: PriorityFeeTier;
};

export const DEFAULT_MAX_COMPUTE_UNIT_LIMIT = 1_400_000;
const LEGACY_COMPUTE_UNIT_PRICE_ENV = "ZINC_COMPUTE_UNIT_PRICE_MICRO_LAMPORTS";
const URGENT_COMPUTE_UNIT_PRICE_ENV =
  "ZINC_URGENT_COMPUTE_UNIT_PRICE_MICRO_LAMPORTS";
const BACKGROUND_COMPUTE_UNIT_PRICE_ENV =
  "ZINC_BACKGROUND_COMPUTE_UNIT_PRICE_MICRO_LAMPORTS";
const DEFAULT_URGENT_COMPUTE_UNIT_PRICE_MICRO_LAMPORTS = 10_000;
const DEFAULT_BACKGROUND_COMPUTE_UNIT_PRICE_MICRO_LAMPORTS = 2_500;
const COMPUTE_BUDGET_SET_COMPUTE_UNIT_PRICE_TAG = 3;

type ProcessGlobal = typeof globalThis & {
  process?: {
    env?: Record<string, string | undefined>;
  };
};

/** Returns whether one instruction targets the compute-budget program with a specific variant tag. */
function isComputeBudgetInstructionWithTag(
  instruction: TransactionInstruction,
  tag: number,
): boolean {
  return (
    instruction.programId.equals(ComputeBudgetProgram.programId) &&
    instruction.data[0] === tag
  );
}

/** Resolves the raw configured compute-unit price for a priority-fee tier. */
function getComputeUnitPriceRawValue(priorityFeeTier: PriorityFeeTier): {
  envName: string;
  rawValue: string;
} {
  const processEnv = (globalThis as ProcessGlobal).process?.env;
  if (priorityFeeTier === "urgent") {
    const urgentValue = processEnv?.[URGENT_COMPUTE_UNIT_PRICE_ENV];
    if (urgentValue !== undefined) {
      return {
        envName: URGENT_COMPUTE_UNIT_PRICE_ENV,
        rawValue: urgentValue,
      };
    }
    const legacyValue = processEnv?.[LEGACY_COMPUTE_UNIT_PRICE_ENV];
    if (legacyValue !== undefined) {
      return {
        envName: LEGACY_COMPUTE_UNIT_PRICE_ENV,
        rawValue: legacyValue,
      };
    }
    return {
      envName: URGENT_COMPUTE_UNIT_PRICE_ENV,
      rawValue: String(DEFAULT_URGENT_COMPUTE_UNIT_PRICE_MICRO_LAMPORTS),
    };
  }

  return {
    envName: BACKGROUND_COMPUTE_UNIT_PRICE_ENV,
    rawValue:
      processEnv?.[BACKGROUND_COMPUTE_UNIT_PRICE_ENV] ??
      String(DEFAULT_BACKGROUND_COMPUTE_UNIT_PRICE_MICRO_LAMPORTS),
  };
}

/** Loads the configured compute-unit price for a priority-fee tier. */
function getComputeUnitPriceMicroLamports(
  priorityFeeTier: PriorityFeeTier,
): number | undefined {
  const { envName, rawValue } = getComputeUnitPriceRawValue(priorityFeeTier);
  const trimmedValue = rawValue.trim();
  const price = Number(trimmedValue);
  if (!Number.isSafeInteger(price) || price < 0) {
    throw new Error(`Invalid ${envName} value ${JSON.stringify(trimmedValue)}`);
  }

  return price > 0 ? price : undefined;
}

/** Prepends default compute-budget instructions unless the caller already supplied them. */
function withDefaultComputeBudget(
  instructions: readonly TransactionInstruction[],
  options: ComputeBudgetOptions = {},
): TransactionInstruction[] {
  const callerConfiguredComputeBudget = instructions.some((instruction) =>
    instruction.programId.equals(ComputeBudgetProgram.programId),
  );
  const callerConfiguredComputeUnitPrice = instructions.some((instruction) =>
    isComputeBudgetInstructionWithTag(
      instruction,
      COMPUTE_BUDGET_SET_COMPUTE_UNIT_PRICE_TAG,
    ),
  );
  const computeBudgetInstructions: TransactionInstruction[] = [];

  if (!callerConfiguredComputeBudget) {
    computeBudgetInstructions.push(
      ComputeBudgetProgram.setComputeUnitLimit({
        units: DEFAULT_MAX_COMPUTE_UNIT_LIMIT,
      }),
    );
  }

  if (!callerConfiguredComputeUnitPrice) {
    const computeUnitPrice = getComputeUnitPriceMicroLamports(
      options.priorityFeeTier ?? "urgent",
    );
    if (computeUnitPrice !== undefined) {
      computeBudgetInstructions.push(
        ComputeBudgetProgram.setComputeUnitPrice({
          microLamports: computeUnitPrice,
        }),
      );
    }
  }

  if (computeBudgetInstructions.length === 0) {
    return [...instructions];
  }

  return [...computeBudgetInstructions, ...instructions];
}

export function toAccountMeta(
  key: PublicKey,
  isWritable: boolean,
): AccountMeta {
  return {
    pubkey: key,
    isSigner: false,
    isWritable,
  };
}

export function toTransactionSigner(pubkey: PublicKey): TransactionSigner {
  return {
    address: address(pubkey.toBase58()),
    signTransactions: async (txs) => txs,
  } as TransactionSigner;
}

export function toTransactionInstruction(instruction: {
  programAddress: Address;
  accounts: readonly { address: Address; role: number; signer?: unknown }[];
  data: ReadonlyUint8Array;
}): TransactionInstruction {
  return new TransactionInstruction({
    programId: new PublicKey(instruction.programAddress),
    keys: instruction.accounts.map((account) => ({
      pubkey: new PublicKey(account.address),
      isSigner: account.role >= 2,
      isWritable: account.role === 1 || account.role === 3,
    })),
    data: Buffer.from(instruction.data),
  });
}

export async function processTransaction(
  instructions: TransactionInstruction[],
  connection: Connection,
  payer: Keypair,
  lookupTableAccount?: AddressLookupTableAccount,
  options: ComputeBudgetOptions = {},
): Promise<TxnResult> {
  const blockhash = await connection.getLatestBlockhash();
  const instructionsWithComputeBudget = withDefaultComputeBudget(
    instructions,
    options,
  );

  if (lookupTableAccount) {
    const messageV0 = new TransactionMessage({
      payerKey: payer.publicKey,
      recentBlockhash: blockhash.blockhash,
      instructions: instructionsWithComputeBudget,
    }).compileToV0Message([lookupTableAccount]);
    const transactionV0 = new VersionedTransaction(messageV0);
    transactionV0.sign([payer]);

    const signature = await connection.sendTransaction(transactionV0);
    const strategy: BlockheightBasedTransactionConfirmationStrategy = {
      signature,
      blockhash: blockhash.blockhash,
      lastValidBlockHeight: blockhash.lastValidBlockHeight,
    };
    const confirmation = await connection.confirmTransaction(
      strategy,
      "confirmed",
    );

    return {
      Signature: signature,
      SignatureResult: confirmation.value,
    };
  }

  const transaction = new Transaction();
  instructionsWithComputeBudget.forEach((instruction) =>
    transaction.add(instruction),
  );
  transaction.recentBlockhash = blockhash.blockhash;
  transaction.feePayer = payer.publicKey;
  transaction.sign(payer);

  const signature = await connection.sendRawTransaction(
    transaction.serialize(),
    {
      maxRetries: 3,
      preflightCommitment: "confirmed",
      skipPreflight: true,
    },
  );
  const strategy: BlockheightBasedTransactionConfirmationStrategy = {
    signature,
    blockhash: blockhash.blockhash,
    lastValidBlockHeight: blockhash.lastValidBlockHeight,
  };
  const confirmation = await connection.confirmTransaction(
    strategy,
    "confirmed",
  );

  return {
    Signature: signature,
    SignatureResult: confirmation.value,
  };
}

export async function processAndValidateTransaction(
  instructions: TransactionInstruction[],
  connection: Connection,
  signer: Keypair,
  lookupTableAccount?: AddressLookupTableAccount,
  options: ComputeBudgetOptions = {},
): Promise<TxnResult> {
  const result = await processTransaction(
    instructions,
    connection,
    signer,
    lookupTableAccount,
    options,
  );

  if (result.SignatureResult.err === null) {
    return result;
  }

  const transaction = await connection.getParsedTransaction(result.Signature, {
    commitment: "confirmed",
    maxSupportedTransactionVersion: 0,
  });
  const logs = transaction?.meta?.logMessages?.join("\n");
  throw new Error(logs || JSON.stringify(result.SignatureResult.err));
}
