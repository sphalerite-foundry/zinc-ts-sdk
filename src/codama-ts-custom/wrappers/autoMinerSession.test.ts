import assert from "node:assert/strict";
import { test } from "node:test";
import { Keypair } from "@solana/web3.js";
import {
  getCancelAutoMinerSessionInstructionDataDecoder,
  getInitAutoMinerSessionInstructionDataDecoder,
  getReloadAutoMinerSessionSolInstructionDataDecoder,
  getTopUpAutoMinerSessionInstructionDataDecoder,
  getUpdateAutoMinerSessionInstructionDataDecoder,
} from "../../codama-ts";
import {
  getAutoMinerSessionAddress,
  getConfigAddress,
  getPlayerProfileAddress,
} from "../pda";
import {
  buildCancelAutoMinerSessionInstruction,
  buildInitAutoMinerSessionInstruction,
  buildReloadAutoMinerSessionSolInstruction,
  buildTopUpAutoMinerSessionInstruction,
  buildUpdateAutoMinerSessionInstruction,
} from "./autoMinerSession";

const AMOUNT_PER_ROUND = 40_000_000n;
const INITIAL_BUDGET = 400_000_000n;
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
    crankReimbursementLamports: REIMBURSEMENT_LAMPORTS,
    autoReloadSolRewards: true,
  });
  const decodedData = getInitAutoMinerSessionInstructionDataDecoder().decode(
    instruction.data,
  );

  assert.equal(instruction.keys[0]?.pubkey.toBase58(), signer.toBase58());
  assert.equal(
    instruction.keys[1]?.pubkey.toBase58(),
    getConfigAddress()[0].toBase58(),
  );
  assert.equal(
    instruction.keys[2]?.pubkey.toBase58(),
    getAutoMinerSessionAddress(signer)[0].toBase58(),
  );
  assert.equal(
    instruction.keys[3]?.pubkey.toBase58(),
    getPlayerProfileAddress(signer)[0].toBase58(),
  );
  assert.equal(decodedData.executor, executor.toBase58());
  assert.equal(decodedData.amountPerRound, AMOUNT_PER_ROUND);
  assert.equal(decodedData.initialBudget, INITIAL_BUDGET);
  assert.equal(decodedData.crankReimbursementLamports, REIMBURSEMENT_LAMPORTS);
  assert.equal(decodedData.autoReloadSolRewards, true);
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
    paused: true,
    crankReimbursementLamports: REIMBURSEMENT_LAMPORTS,
    autoReloadSolRewards: true,
  });
  const decodedData = getUpdateAutoMinerSessionInstructionDataDecoder().decode(
    instruction.data,
  );

  assert.equal(
    instruction.keys[1]?.pubkey.toBase58(),
    getConfigAddress()[0].toBase58(),
  );
  assert.equal(
    instruction.keys[2]?.pubkey.toBase58(),
    getAutoMinerSessionAddress(signer)[0].toBase58(),
  );
  assert.equal(decodedData.executor, executor.toBase58());
  assert.equal(decodedData.paused, true);
  assert.equal(decodedData.autoReloadSolRewards, true);
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

test("buildReloadAutoMinerSessionSolInstruction derives reload accounts", async () => {
  const executor = Keypair.generate().publicKey;
  const authority = Keypair.generate().publicKey;
  const instruction = await buildReloadAutoMinerSessionSolInstruction({
    executor,
    authority,
  });
  const decodedData =
    getReloadAutoMinerSessionSolInstructionDataDecoder().decode(
      instruction.data,
    );

  assert.equal(instruction.keys[0]?.pubkey.toBase58(), executor.toBase58());
  assert.equal(instruction.keys[2]?.pubkey.toBase58(), authority.toBase58());
  assert.equal(
    instruction.keys[3]?.pubkey.toBase58(),
    getAutoMinerSessionAddress(authority)[0].toBase58(),
  );
  assert.equal(
    instruction.keys[4]?.pubkey.toBase58(),
    getPlayerProfileAddress(authority)[0].toBase58(),
  );
  assert.deepEqual(
    Array.from(decodedData.discriminator),
    [26, 170, 147, 196, 38, 148, 159, 234],
  );
});
