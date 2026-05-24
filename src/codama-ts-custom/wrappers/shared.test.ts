import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import {
  DEFAULT_ARCIUM_CLUSTER_OFFSET,
  resolveArciumClusterOffset,
} from "./shared";

const originalClusterOffset = process.env.ARCIUM_CLUSTER_OFFSET;
const originalServerClusterOffset = process.env.CLUSTER_OFFSET;

afterEach(() => {
  if (originalClusterOffset === undefined) {
    delete process.env.ARCIUM_CLUSTER_OFFSET;
  } else {
    process.env.ARCIUM_CLUSTER_OFFSET = originalClusterOffset;
  }
  if (originalServerClusterOffset === undefined) {
    delete process.env.CLUSTER_OFFSET;
  } else {
    process.env.CLUSTER_OFFSET = originalServerClusterOffset;
  }
});

test("resolveArciumClusterOffset prefers an explicit argument", () => {
  process.env.ARCIUM_CLUSTER_OFFSET = "10000";

  assert.equal(resolveArciumClusterOffset(2026), 2026);
});

test("resolveArciumClusterOffset reads ARCIUM_CLUSTER_OFFSET", () => {
  process.env.ARCIUM_CLUSTER_OFFSET = "2026";

  assert.equal(resolveArciumClusterOffset(), 2026);
});

test("resolveArciumClusterOffset reads the server CLUSTER_OFFSET fallback", () => {
  delete process.env.ARCIUM_CLUSTER_OFFSET;
  process.env.CLUSTER_OFFSET = "10000";

  assert.equal(resolveArciumClusterOffset(), 10000);
});

test("resolveArciumClusterOffset defaults to the production Arcium cluster", () => {
  delete process.env.ARCIUM_CLUSTER_OFFSET;

  assert.equal(resolveArciumClusterOffset(), DEFAULT_ARCIUM_CLUSTER_OFFSET);
});

test("resolveArciumClusterOffset rejects invalid env values", () => {
  process.env.ARCIUM_CLUSTER_OFFSET = "not-a-number";

  assert.throws(
    () => resolveArciumClusterOffset(),
    /ARCIUM_CLUSTER_OFFSET environment variable is invalid/,
  );
});
