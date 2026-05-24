import assert from "node:assert/strict";
import { test } from "node:test";
import { Keypair } from "@solana/web3.js";
import {
  getSettlePrivateZkSingleInstruction,
  getSettlePrivateZkSingleInstructionDataDecoder,
} from "../../codama-ts";
import {
  getBoardAddress,
  getConfigAddress,
  getMinerAddress,
  getPlayerProfileAddress,
  getRoundAddress,
  getRoundSecretAddress,
  getTreasuryAddress,
} from "../pda";
import {
  toTransactionInstruction,
  toTransactionSigner,
} from "../utils/sol-helpers";
import { toAddress } from "./shared";

const ROUND_ID = 225n;

test("settlePrivateZkSingle wires proof outputs without Arcium or round-secret accounts", () => {
  const signer = Keypair.generate().publicKey;
  const player = Keypair.generate().publicKey;
  const proof = Uint8Array.from({ length: 256 }, (_, index) => index & 0xff);
  const round = getRoundAddress(ROUND_ID)[0];
  const miner = getMinerAddress(ROUND_ID, player)[0];
  const playerProfile = getPlayerProfileAddress(player)[0];
  const instruction = getSettlePrivateZkSingleInstruction({
    signer: toTransactionSigner(signer),
    config: toAddress(getConfigAddress()[0]),
    board: toAddress(getBoardAddress()[0]),
    round: toAddress(round),
    miner: toAddress(miner),
    playerProfile: toAddress(playerProfile),
    treasury: toAddress(getTreasuryAddress()[0]),
    proof,
    winningStake: 333_333_333n,
    selectedCount: 3,
  });
  const decoded = getSettlePrivateZkSingleInstructionDataDecoder().decode(
    instruction.data,
  );
  const web3Instruction = toTransactionInstruction(
    instruction as Parameters<typeof toTransactionInstruction>[0],
  );
  const accountKeys = web3Instruction.keys.map((meta) =>
    meta.pubkey.toBase58(),
  );

  assert.deepEqual(Array.from(decoded.proof), Array.from(proof));
  assert.equal(decoded.winningStake, 333_333_333n);
  assert.equal(decoded.selectedCount, 3);
  assert.equal(web3Instruction.keys.length, 7);
  assert.equal(web3Instruction.keys[0]?.pubkey.toBase58(), signer.toBase58());
  assert.equal(web3Instruction.keys[0]?.isSigner, true);
  assert.equal(web3Instruction.keys[0]?.isWritable, true);
  assert.equal(web3Instruction.keys[3]?.pubkey.toBase58(), round.toBase58());
  assert.equal(web3Instruction.keys[3]?.isWritable, true);
  assert.equal(web3Instruction.keys[4]?.pubkey.toBase58(), miner.toBase58());
  assert.equal(web3Instruction.keys[4]?.isWritable, true);
  assert.equal(
    web3Instruction.keys[5]?.pubkey.toBase58(),
    playerProfile.toBase58(),
  );
  assert.equal(web3Instruction.keys[5]?.isWritable, true);
  assert.ok(
    !accountKeys.includes(getRoundSecretAddress(ROUND_ID)[0].toBase58()),
  );
});
