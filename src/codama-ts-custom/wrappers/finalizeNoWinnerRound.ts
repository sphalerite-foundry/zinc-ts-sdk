import { Connection, PublicKey, TransactionInstruction } from "@solana/web3.js";
import { ZINC_PROGRAM_ID } from "../constants";
import {
  fetchTreasuryAccount,
  getBoardAddress,
  getConfigAddress,
  getStockpileSolVaultAddress,
  getRoundAddress,
  getRoundZincPayoutTokenAccountAddress,
  getTreasuryAddress,
} from "../pda";

const FINALIZE_NO_WINNER_ROUND_DISCRIMINATOR = Buffer.from([
  208, 203, 217, 27, 206, 70, 45, 36,
]);
const TOKEN_PROGRAM_ID = new PublicKey(
  "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
);

export type BuildFinalizeNoWinnerRoundInstruction = {
  /** RPC connection used to resolve the treasury-owned ZINC accounts. */
  connection: Connection;
  signer: PublicKey;
  roundId: number | bigint;
};

export async function buildFinalizeNoWinnerRoundInstruction({
  connection,
  signer,
  roundId,
}: BuildFinalizeNoWinnerRoundInstruction): Promise<TransactionInstruction> {
  const round = getRoundAddress(roundId)[0];
  const treasury = getTreasuryAddress()[0];
  const treasuryAccount = await fetchTreasuryAccount(connection, treasury);
  const zincMint = new PublicKey(treasuryAccount.data.zincMint);
  const roundZincPayoutTokenAccount = getRoundZincPayoutTokenAccountAddress(
    roundId,
    treasury,
    zincMint,
  )[0];
  return new TransactionInstruction({
    programId: ZINC_PROGRAM_ID,
    keys: [
      { pubkey: signer, isSigner: true, isWritable: true },
      { pubkey: getConfigAddress()[0], isSigner: false, isWritable: false },
      { pubkey: getBoardAddress()[0], isSigner: false, isWritable: false },
      { pubkey: round, isSigner: false, isWritable: true },
      { pubkey: treasury, isSigner: false, isWritable: true },
      {
        pubkey: getStockpileSolVaultAddress()[0],
        isSigner: false,
        isWritable: true,
      },
      {
        pubkey: zincMint,
        isSigner: false,
        isWritable: true,
      },
      {
        pubkey: roundZincPayoutTokenAccount,
        isSigner: false,
        isWritable: true,
      },
      {
        pubkey: new PublicKey(treasuryAccount.data.bonanzaTokenAccount),
        isSigner: false,
        isWritable: true,
      },
      {
        pubkey: new PublicKey(treasuryAccount.data.stockpileTokenAccount),
        isSigner: false,
        isWritable: true,
      },
      { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
    ],
    data: FINALIZE_NO_WINNER_ROUND_DISCRIMINATOR,
  });
}
