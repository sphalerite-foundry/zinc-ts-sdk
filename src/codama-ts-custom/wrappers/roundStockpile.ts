export type RoundStockpilePointers = {
  activeStockpileId: bigint | undefined;
  unresolvedStockpileId: bigint | undefined;
  nextStockpileId: bigint;
};

/** Resolves the stockpile account that round instructions can pass for stockpile validation. */
export function resolveRoundStockpileId({
  activeStockpileId,
  unresolvedStockpileId,
  nextStockpileId,
}: RoundStockpilePointers): bigint {
  if (activeStockpileId !== undefined) {
    return activeStockpileId;
  }
  if (unresolvedStockpileId !== undefined) {
    return unresolvedStockpileId;
  }
  if (nextStockpileId > 0n) {
    return nextStockpileId - 1n;
  }
  throw new Error("Board has no initialized stockpile account");
}
