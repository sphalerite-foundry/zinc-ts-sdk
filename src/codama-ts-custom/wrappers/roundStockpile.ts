export type RoundStockpilePointers = {
  activeStockpileId: bigint | undefined;
  unresolvedStockpileId: bigint | undefined;
  nextStockpileId: bigint;
};

/** Resolves the active stockpile account that round instructions can pass for validation. */
export function resolveRoundStockpileId(
  pointers: RoundStockpilePointers,
): bigint | undefined {
  if (pointers.activeStockpileId !== undefined) {
    return pointers.activeStockpileId;
  }
  return undefined;
}
