import assert from "node:assert/strict";
import { test } from "node:test";
import { Keypair } from "@solana/web3.js";
import { getPlayerProfileAddress } from "../pda";
import { buildRegisterAffiliateInstruction } from "./registerAffiliate";

test("buildRegisterAffiliateInstruction derives signer and affiliate profile PDAs", async () => {
  const signer = Keypair.generate().publicKey;
  const affiliate = Keypair.generate().publicKey;
  const instruction = await buildRegisterAffiliateInstruction({
    signer,
    affiliate,
  });

  assert.equal(instruction.keys[0].pubkey.toBase58(), signer.toBase58());
  assert.equal(instruction.keys[0].isSigner, true);
  assert.equal(instruction.keys[0].isWritable, true);
  assert.equal(
    instruction.keys[1].pubkey.toBase58(),
    getPlayerProfileAddress(signer)[0].toBase58(),
  );
  assert.equal(instruction.keys[1].isWritable, true);
  assert.equal(instruction.keys[2].pubkey.toBase58(), affiliate.toBase58());
  assert.equal(instruction.keys[2].isWritable, false);
  assert.equal(
    instruction.keys[3].pubkey.toBase58(),
    getPlayerProfileAddress(affiliate)[0].toBase58(),
  );
  assert.equal(instruction.keys[3].isWritable, false);
});
