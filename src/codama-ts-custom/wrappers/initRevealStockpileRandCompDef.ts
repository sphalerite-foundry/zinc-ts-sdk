import BN from "bn.js";
import { Buffer } from "buffer";
import {
  getCompDefAccAddress,
  getCompDefAccOffset,
  getLookupTableAddress,
  getMXEAccAddress,
} from "@arcium-hq/client";
import { Connection, PublicKey, TransactionInstruction } from "@solana/web3.js";
import { getInitRevealStockpileRandCompDefInstruction } from "../../codama-ts/instructions";
import { REVEAL_STOCKPILE_RAND_CIRCUIT, ZINC_PROGRAM_ID } from "../constants";
import { getConfigAddress } from "../pda";
import { fetchDecodedMxeAccount } from "../utils/internal";
import {
  toTransactionInstruction,
  toTransactionSigner,
} from "../utils/sol-helpers";
import { resolveCompDefSource } from "./compDefSource";
import { toAddress } from "./shared";

function getInitRevealStockpileRandCompDefOffset(): number {
  return Buffer.from(
    getCompDefAccOffset(REVEAL_STOCKPILE_RAND_CIRCUIT)
  ).readUInt32LE(0);
}

export type BuildInitRevealStockpileRandCompDefInstruction = {
  payer: PublicKey;
  connection: Connection;
  source?: string;
};

export async function buildInitRevealStockpileRandCompDefInstruction({
  payer,
  connection,
  source,
}: BuildInitRevealStockpileRandCompDefInstruction): Promise<TransactionInstruction> {
  const config = getConfigAddress()[0];
  const mxeAccount = getMXEAccAddress(ZINC_PROGRAM_ID);
  const compDefAccount = getCompDefAccAddress(
    ZINC_PROGRAM_ID,
    getInitRevealStockpileRandCompDefOffset()
  );
  const mxe = await fetchDecodedMxeAccount(connection, mxeAccount);
  const addressLookupTable = getLookupTableAddress(
    ZINC_PROGRAM_ID,
    new BN(mxe.data.lutOffsetSlot.toString())
  );
  const instruction = getInitRevealStockpileRandCompDefInstruction({
    payer: toTransactionSigner(payer),
    config: toAddress(config),
    mxeAccount: toAddress(mxeAccount),
    compDefAccount: toAddress(compDefAccount),
    addressLookupTable: toAddress(addressLookupTable),
    args: {
      source: resolveCompDefSource(REVEAL_STOCKPILE_RAND_CIRCUIT, source),
    },
  });
  return toTransactionInstruction(
    instruction as Parameters<typeof toTransactionInstruction>[0]
  );
}
