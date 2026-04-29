import assert from "node:assert/strict";
import { test } from "node:test";
import { resolveRoundStockpileId } from "./roundStockpile";

test("resolveRoundStockpileId prefers the active stockpile", () => {
  assert.equal(
    resolveRoundStockpileId({
      activeStockpileId: 7n,
      unresolvedStockpileId: 8n,
      nextStockpileId: 9n,
    }),
    7n,
  );
});

test("resolveRoundStockpileId uses unresolved stockpile without an active stockpile", () => {
  assert.equal(
    resolveRoundStockpileId({
      activeStockpileId: undefined,
      unresolvedStockpileId: 8n,
      nextStockpileId: 9n,
    }),
    8n,
  );
});

test("resolveRoundStockpileId falls back to latest initialized stockpile between cycles", () => {
  assert.equal(
    resolveRoundStockpileId({
      activeStockpileId: undefined,
      unresolvedStockpileId: undefined,
      nextStockpileId: 9n,
    }),
    8n,
  );
});

test("resolveRoundStockpileId rejects before any stockpile has been initialized", () => {
  assert.throws(
    () =>
      resolveRoundStockpileId({
        activeStockpileId: undefined,
        unresolvedStockpileId: undefined,
        nextStockpileId: 0n,
      }),
    /no initialized stockpile account/,
  );
});
