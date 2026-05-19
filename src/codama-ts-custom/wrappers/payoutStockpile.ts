import { Connection, PublicKey, TransactionInstruction } from "@solana/web3.js";
import { getPayoutStockpileInstructionAsync } from "../../codama-ts/instructions";
import {
  fetchTreasuryAccount,
  getStockpileAddress,
  getStockpileExtrasAddress,
  getStockpileWinnersAddress,
  getTreasuryAddress,
} from "../pda";
import {
  toTransactionInstruction,
  toTransactionSigner,
} from "../utils/sol-helpers";
import { getClassicAtaAddress, toAddress } from "./shared";

export type BuildPayoutStockpileInstruction = {
  connection: Connection;
  signer: PublicKey;
  stockpileId: number | bigint;
  rank?: number;
  winner: PublicKey;
};

export async function buildPayoutStockpileInstruction({
  connection,
  signer,
  stockpileId,
  rank = 0,
  winner,
}: BuildPayoutStockpileInstruction): Promise<TransactionInstruction> {
  const stockpile = getStockpileAddress(stockpileId)[0];
  const stockpileWinners = getStockpileWinnersAddress(stockpileId)[0];
  const treasury = getTreasuryAddress()[0];
  const treasuryAccount = await fetchTreasuryAccount(connection, treasury);
  const zincMint = new PublicKey(treasuryAccount.data.zincMint);
  const winnerZincTokenAccount = getClassicAtaAddress(winner, zincMint);
  const instruction = await getPayoutStockpileInstructionAsync({
    signer: toTransactionSigner(signer),
    stockpile: toAddress(stockpile),
    stockpileWinners: toAddress(stockpileWinners),
    stockpileExtras: toAddress(getStockpileExtrasAddress()[0]),
    zincMint: toAddress(zincMint),
    stockpileTokenAccount: toAddress(
      new PublicKey(treasuryAccount.data.stockpileTokenAccount),
    ),
    winner: toAddress(winner),
    winnerZincTokenAccount: toAddress(winnerZincTokenAccount),
    rank,
  });
  return toTransactionInstruction(
    instruction as Parameters<typeof toTransactionInstruction>[0],
  );
}
