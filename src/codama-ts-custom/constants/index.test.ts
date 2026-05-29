import assert from "node:assert/strict";
import test from "node:test";

import { MINER_ACCOUNT_SIZE_BYTES } from ".";

test("MINER_ACCOUNT_SIZE_BYTES mirrors the protocol allocation size", () => {
  assert.equal(MINER_ACCOUNT_SIZE_BYTES, 440);
});
