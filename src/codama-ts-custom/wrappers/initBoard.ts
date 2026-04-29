import { Connection, PublicKey, TransactionInstruction } from "@solana/web3.js";
import { getInitBoardInstructionAsync } from "../../codama-ts";
import { fetchConfigAccount, getBoardAddress, getConfigAddress } from "../pda";
import {
  toTransactionInstruction,
  toTransactionSigner,
} from "../utils/sol-helpers";
import { toAddress } from "./shared";

export type BuildInitBoardInstruction = {
  connection: Connection;
};

export async function buildInitBoardInstruction({
  connection,
}: BuildInitBoardInstruction): Promise<TransactionInstruction> {
  const board = getBoardAddress()[0];
  const config = getConfigAddress()[0];
  const configAccount = await fetchConfigAccount(connection);
  const instruction = await getInitBoardInstructionAsync({
    authority: toTransactionSigner(new PublicKey(configAccount.data.crank)),
    config: toAddress(config),
    board: toAddress(board),
  });
  return toTransactionInstruction(
    instruction as Parameters<typeof toTransactionInstruction>[0],
  );
}
