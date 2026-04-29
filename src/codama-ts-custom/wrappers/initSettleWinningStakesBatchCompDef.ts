import BN from "bn.js";
import { Buffer } from "buffer";
import {
  getCompDefAccAddress,
  getCompDefAccOffset,
  getLookupTableAddress,
  getMXEAccAddress,
} from "@arcium-hq/client";
import { Connection, PublicKey, TransactionInstruction } from "@solana/web3.js";
import { getInitSettleWinningStakesBatchCompDefInstruction } from "../../codama-ts/instructions";
import {
  SETTLE_WINNING_STAKES_BATCH_CIRCUIT,
  ZINC_PROGRAM_ID,
} from "../constants";
import { getConfigAddress } from "../pda";
import { fetchDecodedMxeAccount } from "../utils/internal";
import {
  toTransactionInstruction,
  toTransactionSigner,
} from "../utils/sol-helpers";
import { resolveCompDefSource } from "./compDefSource";
import { toAddress } from "./shared";

function getInitSettleWinningStakesBatchCompDefOffset(): number {
  return Buffer.from(
    getCompDefAccOffset(SETTLE_WINNING_STAKES_BATCH_CIRCUIT),
  ).readUInt32LE(0);
}

export type BuildInitSettleWinningStakesBatchCompDefInstruction = {
  payer: PublicKey;
  connection: Connection;
  source?: string;
};

export async function buildInitSettleWinningStakesBatchCompDefInstruction({
  payer,
  connection,
  source,
}: BuildInitSettleWinningStakesBatchCompDefInstruction): Promise<TransactionInstruction> {
  const config = getConfigAddress()[0];
  const mxeAccount = getMXEAccAddress(ZINC_PROGRAM_ID);
  const compDefAccount = getCompDefAccAddress(
    ZINC_PROGRAM_ID,
    getInitSettleWinningStakesBatchCompDefOffset(),
  );
  const mxe = await fetchDecodedMxeAccount(connection, mxeAccount);
  const addressLookupTable = getLookupTableAddress(
    ZINC_PROGRAM_ID,
    new BN(mxe.data.lutOffsetSlot.toString()),
  );
  const instruction = getInitSettleWinningStakesBatchCompDefInstruction({
    payer: toTransactionSigner(payer),
    config: toAddress(config),
    mxeAccount: toAddress(mxeAccount),
    compDefAccount: toAddress(compDefAccount),
    addressLookupTable: toAddress(addressLookupTable),
    args: {
      source: resolveCompDefSource(SETTLE_WINNING_STAKES_BATCH_CIRCUIT, source),
    },
  });
  return toTransactionInstruction(
    instruction as Parameters<typeof toTransactionInstruction>[0],
  );
}
