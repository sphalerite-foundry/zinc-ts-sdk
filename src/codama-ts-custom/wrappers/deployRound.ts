import { type ReadonlyUint8Array } from "@solana/kit";
import { Connection, PublicKey, TransactionInstruction } from "@solana/web3.js";
import {
  getDeployRoundInstructionAsync,
  type ZkMaskAttestationArgsArgs,
} from "../../codama-ts";
import {
  toTransactionInstruction,
  toTransactionSigner,
} from "../utils/sol-helpers";
import { toAddress, unwrapOption } from "./shared";
import {
  fetchBoardAccount,
  fetchPlayerProfileAccount,
  getBoardAddress,
  getConfigAddress,
  getStockpileAddress,
  getMinerAddress,
  getPlayerProfileAddress,
  getRoundAddress,
  getTreasuryAddress,
} from "../pda";

export type BuildDeployRoundInstruction = {
  connection: Connection;
  signer: PublicKey;
  /** Optional affiliate account to bind once, or to validate against an existing binding. */
  affiliate?: PublicKey | null;
  roundId: number | bigint;
  totalAmount: number | bigint;
  maskEncryptionKey: ReadonlyUint8Array;
  maskNonce: number | bigint;
  maskCiphertext: ReadonlyUint8Array;
  /** Optional reusable ZK mask attestation required by ZK-capable config modes. */
  zkMaskAttestation?: ZkMaskAttestationArgsArgs | null;
};

/** Builds one deploy-round instruction while preserving immutable affiliate binding semantics. */
export async function buildDeployRoundInstruction({
  connection,
  signer,
  affiliate,
  roundId,
  totalAmount,
  maskEncryptionKey,
  maskNonce,
  maskCiphertext,
  zkMaskAttestation = null,
}: BuildDeployRoundInstruction): Promise<TransactionInstruction> {
  const boardAccount = await fetchBoardAccount(connection);
  const config = getConfigAddress()[0];
  const board = getBoardAddress()[0];
  const treasury = getTreasuryAddress()[0];
  const round = getRoundAddress(roundId)[0];
  const miner = getMinerAddress(roundId, signer)[0];
  const playerProfile = getPlayerProfileAddress(signer)[0];
  let effectiveAffiliate: PublicKey | null = null;
  try {
    const existingPlayerProfile = await fetchPlayerProfileAccount(
      connection,
      playerProfile,
    );
    const boundAffiliate = unwrapOption(existingPlayerProfile.data.affiliate);
    if (boundAffiliate) {
      const storedAffiliate = new PublicKey(boundAffiliate);
      if (affiliate && !affiliate.equals(storedAffiliate)) {
        effectiveAffiliate = affiliate;
      } else {
        effectiveAffiliate = storedAffiliate;
      }
    }
  } catch {
    effectiveAffiliate = null;
  }
  if (effectiveAffiliate === null) {
    effectiveAffiliate = affiliate ?? null;
  }
  if (effectiveAffiliate?.equals(signer)) {
    effectiveAffiliate = null;
  }
  const affiliateProfile = effectiveAffiliate
    ? getPlayerProfileAddress(effectiveAffiliate)[0]
    : null;
  const activeStockpileId = unwrapOption(boardAccount.data.activeStockpileId);
  const stockpile =
    activeStockpileId != null
      ? getStockpileAddress(activeStockpileId)[0]
      : null;
  const instruction = await getDeployRoundInstructionAsync({
    signer: toTransactionSigner(signer),
    round: toAddress(round),
    config: toAddress(config),
    miner: toAddress(miner),
    playerProfile: toAddress(playerProfile),
    board: toAddress(board),
    treasury: toAddress(treasury),
    stockpile: stockpile ? toAddress(stockpile) : undefined,
    affiliate: effectiveAffiliate ? toAddress(effectiveAffiliate) : undefined,
    affiliateProfile: affiliateProfile
      ? toAddress(affiliateProfile)
      : undefined,
    totalAmount,
    maskEncryptionKey,
    maskNonce,
    maskCiphertext,
    zkMaskAttestation,
  });
  return toTransactionInstruction(
    instruction as Parameters<typeof toTransactionInstruction>[0],
  );
}
