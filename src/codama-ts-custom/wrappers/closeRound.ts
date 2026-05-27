import { Connection, PublicKey, TransactionInstruction } from "@solana/web3.js";
import { getCloseRoundInstructionAsync } from "../../codama-ts";
import {
  fetchBoardAccount,
  fetchTreasuryAccount,
  getBoardAddress,
  getConfigAddress,
  getStockpileAddress,
  getRoundAddress,
  getRoundZincPayoutTokenAccountAddress,
  getTreasuryAddress,
} from "../pda";
import {
  toTransactionInstruction,
  toTransactionSigner,
} from "../utils/sol-helpers";
import { toAddress, unwrapOption } from "./shared";
import { resolveRoundStockpileId } from "./roundStockpile";

export type BuildCloseRoundInstruction = {
  /** RPC connection used to resolve the treasury ZINC mint. */
  connection: Connection;
  signer: PublicKey;
  roundId: number | bigint;
};

export async function buildCloseRoundInstruction({
  connection,
  signer,
  roundId,
}: BuildCloseRoundInstruction): Promise<TransactionInstruction> {
  const boardAccount = await fetchBoardAccount(connection);
  const round = getRoundAddress(roundId)[0];
  const board = getBoardAddress()[0];
  const config = getConfigAddress()[0];
  const treasury = getTreasuryAddress()[0];
  const treasuryAccount = await fetchTreasuryAccount(connection, treasury);
  const zincMint = new PublicKey(treasuryAccount.data.zincMint);
  const roundZincPayoutTokenAccount = getRoundZincPayoutTokenAccountAddress(
    roundId,
    treasury,
    zincMint,
  )[0];
  const activeStockpileId = unwrapOption(boardAccount.data.activeStockpileId);
  const unresolvedStockpileId = unwrapOption(
    boardAccount.data.unresolvedStockpileId,
  );
  const stockpileId = resolveRoundStockpileId({
    activeStockpileId,
    unresolvedStockpileId,
    nextStockpileId: boardAccount.data.nextStockpileId,
  });
  const stockpile =
    stockpileId !== undefined ? getStockpileAddress(stockpileId)[0] : null;
  const instruction = await getCloseRoundInstructionAsync({
    signer: toTransactionSigner(signer),
    config: toAddress(config),
    board: toAddress(board),
    round: toAddress(round),
    treasury: toAddress(treasury),
    zincMint: treasuryAccount.data.zincMint,
    curveAdminTokenAccount: treasuryAccount.data.curveAdminTokenAccount,
    bonanzaTokenAccount: treasuryAccount.data.bonanzaTokenAccount,
    roundZincPayoutTokenAccount: toAddress(roundZincPayoutTokenAccount),
    stockpileTokenAccount: treasuryAccount.data.stockpileTokenAccount,
    stockpile: stockpile ? toAddress(stockpile) : undefined,
  });
  return toTransactionInstruction(
    instruction as Parameters<typeof toTransactionInstruction>[0],
  );
}
