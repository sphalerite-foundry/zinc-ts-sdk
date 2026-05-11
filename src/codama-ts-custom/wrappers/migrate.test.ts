import assert from "node:assert/strict";
import { test } from "node:test";
import { Keypair, SystemProgram } from "@solana/web3.js";
import { getMigrateInstructionDataDecoder } from "../../codama-ts";
import { getBoardAddress, getConfigAddress } from "../pda";
import { buildMigrateInstruction } from "./migrate";

test("buildMigrateInstruction targets config and the requested account", async () => {
  const admin = Keypair.generate().publicKey;
  const account = getBoardAddress()[0];
  const instruction = await buildMigrateInstruction({ admin, account });
  const decodedData = getMigrateInstructionDataDecoder().decode(
    instruction.data,
  );

  assert.equal(instruction.keys[0]?.pubkey.toBase58(), admin.toBase58());
  assert.equal(instruction.keys[0]?.isSigner, true);
  assert.equal(instruction.keys[0]?.isWritable, true);
  assert.equal(
    instruction.keys[1]?.pubkey.toBase58(),
    getConfigAddress()[0].toBase58(),
  );
  assert.equal(instruction.keys[1]?.isWritable, true);
  assert.equal(instruction.keys[2]?.pubkey.toBase58(), account.toBase58());
  assert.equal(instruction.keys[2]?.isWritable, true);
  assert.equal(
    instruction.keys[3]?.pubkey.toBase58(),
    SystemProgram.programId.toBase58(),
  );
  assert.equal(instruction.keys[3]?.isWritable, false);
  assert.deepEqual(
    Array.from(decodedData.discriminator),
    [155, 234, 231, 146, 236, 158, 162, 30],
  );
});
