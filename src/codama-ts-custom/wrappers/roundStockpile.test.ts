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

test("resolveRoundStockpileId omits unresolved stockpile without an active stockpile", () => {
  assert.equal(
    resolveRoundStockpileId({
      activeStockpileId: undefined,
      unresolvedStockpileId: 8n,
      nextStockpileId: 9n,
    }),
    undefined,
  );
});

test("resolveRoundStockpileId omits latest initialized stockpile between cycles", () => {
  assert.equal(
    resolveRoundStockpileId({
      activeStockpileId: undefined,
      unresolvedStockpileId: undefined,
      nextStockpileId: 9n,
    }),
    undefined,
  );
});

test("resolveRoundStockpileId omits before any stockpile has been initialized", () => {
  assert.equal(
    resolveRoundStockpileId({
      activeStockpileId: undefined,
      unresolvedStockpileId: undefined,
      nextStockpileId: 0n,
    }),
    undefined,
  );
});
