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

const DEFAULT_MAX_COMPUTE_UNIT_LIMIT = 1_400_000;

/** Prepends the max compute-unit limit unless the caller already supplied compute-budget instructions. */
function withDefaultComputeUnitLimit(
  instructions: readonly TransactionInstruction[],
): TransactionInstruction[] {
  const callerConfiguredComputeBudget = instructions.some((instruction) =>
    instruction.programId.equals(ComputeBudgetProgram.programId),
  );
  if (callerConfiguredComputeBudget) {
    return [...instructions];
  }

  return [
    ComputeBudgetProgram.setComputeUnitLimit({
      units: DEFAULT_MAX_COMPUTE_UNIT_LIMIT,
    }),
    ...instructions,
  ];
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
): Promise<TxnResult> {
  const blockhash = await connection.getLatestBlockhash();
  const instructionsWithComputeBudget =
    withDefaultComputeUnitLimit(instructions);

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
): Promise<TxnResult> {
  const result = await processTransaction(
    instructions,
    connection,
    signer,
    lookupTableAccount,
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
