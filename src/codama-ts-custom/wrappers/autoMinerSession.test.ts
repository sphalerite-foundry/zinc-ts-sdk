import assert from "node:assert/strict";
import { test } from "node:test";
import { Keypair } from "@solana/web3.js";
import {
  getCancelAutoMinerSessionInstructionDataDecoder,
  getInitAutoMinerSessionInstructionDataDecoder,
  getTopUpAutoMinerSessionInstructionDataDecoder,
  getUpdateAutoMinerSessionInstructionDataDecoder,
} from "../../codama-ts";
import { getAutoMinerSessionAddress, getPlayerProfileAddress } from "../pda";
import {
  buildCancelAutoMinerSessionInstruction,
  buildInitAutoMinerSessionInstruction,
  buildTopUpAutoMinerSessionInstruction,
  buildUpdateAutoMinerSessionInstruction,
} from "./autoMinerSession";

const AMOUNT_PER_ROUND = 40_000_000n;
const INITIAL_BUDGET = 400_000_000n;
const MAX_ROUNDS = 9n;
const REIMBURSEMENT_LAMPORTS = 25_000n;
const MASK_BITS_ENCRYPTION_KEY = new Uint8Array(32).fill(1);
const MASK_BITS_CIPHERTEXT = new Uint8Array(32).fill(2);
const MASK_BITS_NONCE = 7n;
const MASK_BITS_KEY_VERSION = 3;

test("buildInitAutoMinerSessionInstruction derives session accounts and encodes args", async () => {
  const signer = Keypair.generate().publicKey;
  const executor = Keypair.generate().publicKey;
  const instruction = await buildInitAutoMinerSessionInstruction({
    signer,
    executor,
    amountPerRound: AMOUNT_PER_ROUND,
    maskBitsEncryptionKey: MASK_BITS_ENCRYPTION_KEY,
    maskBitsNonce: MASK_BITS_NONCE,
    maskBitsCiphertext: MASK_BITS_CIPHERTEXT,
    maskBitsKeyVersion: MASK_BITS_KEY_VERSION,
    initialBudget: INITIAL_BUDGET,
    maxRounds: MAX_ROUNDS,
    crankReimbursementLamports: REIMBURSEMENT_LAMPORTS,
  });
  const decodedData = getInitAutoMinerSessionInstructionDataDecoder().decode(
    instruction.data,
  );

  assert.equal(instruction.keys[0]?.pubkey.toBase58(), signer.toBase58());
  assert.equal(
    instruction.keys[1]?.pubkey.toBase58(),
    getAutoMinerSessionAddress(signer)[0].toBase58(),
  );
  assert.equal(
    instruction.keys[2]?.pubkey.toBase58(),
    getPlayerProfileAddress(signer)[0].toBase58(),
  );
  assert.equal(decodedData.executor, executor.toBase58());
  assert.equal(decodedData.amountPerRound, AMOUNT_PER_ROUND);
  assert.equal(decodedData.initialBudget, INITIAL_BUDGET);
  assert.equal(decodedData.maxRounds, MAX_ROUNDS);
  assert.equal(decodedData.crankReimbursementLamports, REIMBURSEMENT_LAMPORTS);
});

test("buildUpdateAutoMinerSessionInstruction encodes paused settings", async () => {
  const signer = Keypair.generate().publicKey;
  const executor = Keypair.generate().publicKey;
  const instruction = await buildUpdateAutoMinerSessionInstruction({
    signer,
    executor,
    amountPerRound: AMOUNT_PER_ROUND,
    maskBitsEncryptionKey: MASK_BITS_ENCRYPTION_KEY,
    maskBitsNonce: MASK_BITS_NONCE,
    maskBitsCiphertext: MASK_BITS_CIPHERTEXT,
    maskBitsKeyVersion: MASK_BITS_KEY_VERSION,
    maxRounds: MAX_ROUNDS,
    paused: true,
    crankReimbursementLamports: REIMBURSEMENT_LAMPORTS,
  });
  const decodedData = getUpdateAutoMinerSessionInstructionDataDecoder().decode(
    instruction.data,
  );

  assert.equal(
    instruction.keys[1]?.pubkey.toBase58(),
    getAutoMinerSessionAddress(signer)[0].toBase58(),
  );
  assert.equal(decodedData.executor, executor.toBase58());
  assert.equal(decodedData.paused, true);
  assert.equal(decodedData.maxRounds, MAX_ROUNDS);
});

test("buildTopUpAutoMinerSessionInstruction derives session and encodes amount", async () => {
  const signer = Keypair.generate().publicKey;
  const instruction = await buildTopUpAutoMinerSessionInstruction({
    signer,
    amount: INITIAL_BUDGET,
  });
  const decodedData = getTopUpAutoMinerSessionInstructionDataDecoder().decode(
    instruction.data,
  );

  assert.equal(
    instruction.keys[1]?.pubkey.toBase58(),
    getAutoMinerSessionAddress(signer)[0].toBase58(),
  );
  assert.equal(decodedData.amount, INITIAL_BUDGET);
});

test("buildCancelAutoMinerSessionInstruction derives session", async () => {
  const signer = Keypair.generate().publicKey;
  const instruction = await buildCancelAutoMinerSessionInstruction({ signer });
  const decodedData = getCancelAutoMinerSessionInstructionDataDecoder().decode(
    instruction.data,
  );

  assert.equal(
    instruction.keys[1]?.pubkey.toBase58(),
    getAutoMinerSessionAddress(signer)[0].toBase58(),
  );
  assert.deepEqual(
    Array.from(decodedData.discriminator),
    [176, 79, 21, 217, 9, 144, 222, 12],
  );
});
