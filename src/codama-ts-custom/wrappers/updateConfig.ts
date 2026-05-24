import { PublicKey, TransactionInstruction } from "@solana/web3.js";
import { type ReadonlyUint8Array } from "@solana/kit";
import {
  getUpdateConfigInstructionAsync,
  type RoundRandomnessModeArgs,
  type SettlementCapabilityArgs,
} from "../../codama-ts";
import { getBoardAddress, getConfigAddress } from "../pda";
import {
  toTransactionInstruction,
  toTransactionSigner,
} from "../utils/sol-helpers";
import { toAddress, toNullable } from "./shared";

export type BuildUpdateConfigInstruction = {
  admin: PublicKey;
  crank?: PublicKey;
  deployTotalFeeBps?: number | bigint;
  deployAdminFeeBps?: number | bigint;
  deployStockpileFeeBps?: number | bigint;
  deployAffiliateFeeBps?: number | bigint;
  deployAffiliateBonusBricksX10k?: number | bigint;
  affiliateWithdrawalsEnabled?: boolean;
  roundDurationSlots?: number | bigint;
  roundStartDelaySlots?: number | bigint;
  stockpileDurationSlots?: number | bigint;
  stockpileMinEntryBricksX10k?: number | bigint;
  curveAdminFeeBps?: number | bigint;
  winnerZincShareBps?: number | bigint;
  stockpileZincShareBps?: number | bigint;
  noWinnerDirectWinnerZincBonanzaShareBps?: number | bigint;
  noWinnerDirectWinnerZincStockpileShareBps?: number | bigint;
  minDeployLamports?: number | bigint;
  curveMaxRoundMint?: number | bigint;
  curveSaturationLamports?: number | bigint;
  curveHistoryMinted?: number | bigint;
  curveTargetSupportLamportsPerZinc?: number | bigint;
  curveMaxSupply?: number | bigint;
  wildcatRoundFrequency?: number | bigint;
  wildcatWinnerZincSharePpm?: number | bigint;
  bonanzaHitDivisor?: number | bigint;
  roundClaimZincFeeBps?: number | bigint;
  stockpileEntryMinZincFee?: number | bigint;
  stockpileBricksPerZincX10k?: number | bigint;
  stockpileEntryPotFeeBps?: number | bigint;
  stockpileEntryStepBps?: number | bigint;
  stakingBricksPerZincX10k?: number | bigint;
  stakingRewardVestingSlots?: number | bigint;
  arciumRevealCuPriceMicro?: number | bigint;
  stockpileRefillMinEntryBps?: number | bigint;
  roundRandomnessMode?: RoundRandomnessModeArgs;
  settlementCapability?: SettlementCapabilityArgs;
  blockhashRevealDelaySlots?: number | bigint;
  stockpileWinnerCount?: number;
  stockpileWinnerShareBps?: (number | bigint)[];
  zkMaskServerBabyjubPubkeyX?: ReadonlyUint8Array;
  zkMaskServerBabyjubPubkeyY?: ReadonlyUint8Array;
  zkMaskServerKeyVersion?: number | bigint;
  zkMaskCircuitVersion?: number | bigint;
};

export async function buildUpdateConfigInstruction({
  admin,
  crank,
  deployTotalFeeBps,
  deployAdminFeeBps,
  deployStockpileFeeBps,
  deployAffiliateFeeBps,
  deployAffiliateBonusBricksX10k,
  affiliateWithdrawalsEnabled,
  roundDurationSlots,
  roundStartDelaySlots,
  stockpileDurationSlots,
  stockpileMinEntryBricksX10k,
  curveAdminFeeBps,
  winnerZincShareBps,
  stockpileZincShareBps,
  noWinnerDirectWinnerZincBonanzaShareBps,
  noWinnerDirectWinnerZincStockpileShareBps,
  minDeployLamports,
  curveMaxRoundMint,
  curveSaturationLamports,
  curveHistoryMinted,
  curveTargetSupportLamportsPerZinc,
  curveMaxSupply,
  wildcatRoundFrequency,
  wildcatWinnerZincSharePpm,
  bonanzaHitDivisor,
  roundClaimZincFeeBps,
  stockpileEntryMinZincFee,
  stockpileBricksPerZincX10k,
  stockpileEntryPotFeeBps,
  stockpileEntryStepBps,
  stakingBricksPerZincX10k,
  stakingRewardVestingSlots,
  arciumRevealCuPriceMicro,
  stockpileRefillMinEntryBps,
  roundRandomnessMode,
  settlementCapability,
  blockhashRevealDelaySlots,
  stockpileWinnerCount,
  stockpileWinnerShareBps,
  zkMaskServerBabyjubPubkeyX,
  zkMaskServerBabyjubPubkeyY,
  zkMaskServerKeyVersion,
  zkMaskCircuitVersion,
}: BuildUpdateConfigInstruction): Promise<TransactionInstruction> {
  const config = getConfigAddress()[0];
  const board = getBoardAddress()[0];
  const instruction = await getUpdateConfigInstructionAsync({
    admin: toTransactionSigner(admin),
    config: toAddress(config),
    board: toAddress(board),
    deployTotalFeeBps: toNullable(deployTotalFeeBps),
    deployAdminFeeBps: toNullable(deployAdminFeeBps),
    deployStockpileFeeBps: toNullable(deployStockpileFeeBps),
    deployAffiliateFeeBps: toNullable(deployAffiliateFeeBps),
    deployAffiliateBonusBricksX10k: toNullable(deployAffiliateBonusBricksX10k),
    affiliateWithdrawalsEnabled: toNullable(affiliateWithdrawalsEnabled),
    roundDurationSlots: toNullable(roundDurationSlots),
    roundStartDelaySlots: toNullable(roundStartDelaySlots),
    stockpileDurationSlots: toNullable(stockpileDurationSlots),
    stockpileMinEntryBricksX10k: toNullable(stockpileMinEntryBricksX10k),
    curveAdminFeeBps: toNullable(curveAdminFeeBps),
    winnerZincShareBps: toNullable(winnerZincShareBps),
    stockpileZincShareBps: toNullable(stockpileZincShareBps),
    noWinnerDirectWinnerZincBonanzaShareBps: toNullable(
      noWinnerDirectWinnerZincBonanzaShareBps,
    ),
    noWinnerDirectWinnerZincStockpileShareBps: toNullable(
      noWinnerDirectWinnerZincStockpileShareBps,
    ),
    minDeployLamports: toNullable(minDeployLamports),
    curveMaxRoundMint: toNullable(curveMaxRoundMint),
    curveSaturationLamports: toNullable(curveSaturationLamports),
    curveHistoryMinted: toNullable(curveHistoryMinted),
    curveTargetSupportLamportsPerZinc: toNullable(
      curveTargetSupportLamportsPerZinc,
    ),
    curveMaxSupply: toNullable(curveMaxSupply),
    wildcatRoundFrequency: toNullable(wildcatRoundFrequency),
    wildcatWinnerZincSharePpm: toNullable(wildcatWinnerZincSharePpm),
    bonanzaHitDivisor: toNullable(bonanzaHitDivisor),
    roundClaimZincFeeBps: toNullable(roundClaimZincFeeBps),
    stockpileEntryMinZincFee: toNullable(stockpileEntryMinZincFee),
    stockpileBricksPerZincX10k: toNullable(stockpileBricksPerZincX10k),
    stockpileEntryPotFeeBps: toNullable(stockpileEntryPotFeeBps),
    stockpileEntryStepBps: toNullable(stockpileEntryStepBps),
    stakingBricksPerZincX10k: toNullable(stakingBricksPerZincX10k),
    stakingRewardVestingSlots: toNullable(stakingRewardVestingSlots),
    arciumRevealCuPriceMicro: toNullable(arciumRevealCuPriceMicro),
    stockpileRefillMinEntryBps: toNullable(stockpileRefillMinEntryBps),
    roundRandomnessMode: toNullable(roundRandomnessMode),
    settlementCapability: toNullable(settlementCapability),
    blockhashRevealDelaySlots: toNullable(blockhashRevealDelaySlots),
    stockpileWinnerCount: toNullable(stockpileWinnerCount),
    stockpileWinnerShareBps: toNullable(stockpileWinnerShareBps),
    zkMaskServerBabyjubPubkeyX: toNullable(zkMaskServerBabyjubPubkeyX),
    zkMaskServerBabyjubPubkeyY: toNullable(zkMaskServerBabyjubPubkeyY),
    zkMaskServerKeyVersion: toNullable(zkMaskServerKeyVersion),
    zkMaskCircuitVersion: toNullable(zkMaskCircuitVersion),
    crank: crank ? toAddress(crank) : null,
  });

  return toTransactionInstruction(
    instruction as Parameters<typeof toTransactionInstruction>[0],
  );
}
