import assert from "node:assert/strict";
import { test } from "node:test";
import { Connection, Keypair } from "@solana/web3.js";
import { WSOL_MINT_ADDRESS } from "../constants";
import {
  getBuybackPoolAddress,
  getBuybackFeeWsolTokenAccountAddress,
  getBuybackFeeZincTokenAccountAddress,
  getBuybackLpWsolTokenAccountAddress,
  getBuybackLpZincTokenAccountAddress,
  getBuybackZincTokenAccountAddress,
  getConfigAddress,
  getStakingRewardTokenAccountAddress,
  getTreasuryAddress,
} from "../pda";
import {
  buildBuybackInstruction,
  buildClaimBuybackPoolFeesInstruction,
  buildRemoveBuybackLiquidityInstruction,
} from "./buyback";
import { getClassicAtaAddress } from "./shared";
import {
  buildWrapBuybackSolInstruction,
  buildWrapBuybackSolInstructions,
} from "./wrapBuybackSol";

const CONNECTION = new Connection("http://127.0.0.1:8899");

test("buildWrapBuybackSolInstruction derives treasury WSOL custody", async () => {
  const signer = Keypair.generate().publicKey;
  const treasury = getTreasuryAddress()[0];
  const instruction = await buildWrapBuybackSolInstruction({
    signer,
    amount: 123n,
  });

  assert.equal(instruction.keys[0]?.pubkey.toBase58(), signer.toBase58());
  assert.equal(instruction.keys[0]?.isSigner, true);
  assert.equal(
    instruction.keys[1]?.pubkey.toBase58(),
    getConfigAddress()[0].toBase58(),
  );
  assert.equal(instruction.keys[2]?.pubkey.toBase58(), treasury.toBase58());
  assert.equal(
    instruction.keys[4]?.pubkey.toBase58(),
    WSOL_MINT_ADDRESS.toBase58(),
  );
  assert.equal(
    instruction.keys[5]?.pubkey.toBase58(),
    getClassicAtaAddress(treasury, WSOL_MINT_ADDRESS).toBase58(),
  );
});

test("buildWrapBuybackSolInstructions appends native sync", async () => {
  const signer = Keypair.generate().publicKey;
  const treasury = getTreasuryAddress()[0];
  const treasuryWsolTokenAccount = getClassicAtaAddress(
    treasury,
    WSOL_MINT_ADDRESS,
  );
  const instructions = await buildWrapBuybackSolInstructions({
    signer,
    amount: 123n,
  });

  assert.equal(instructions.length, 2);
  assert.equal(instructions[0]?.keys[0]?.pubkey.toBase58(), signer.toBase58());
  assert.equal(
    instructions[1]?.keys[0]?.pubkey.toBase58(),
    treasuryWsolTokenAccount.toBase58(),
  );
  assert.equal(instructions[1]?.keys[0]?.isWritable, true);
});

test("buildBuybackInstruction targets the stored Meteora pool accounts", async () => {
  const signer = Keypair.generate().publicKey;
  const treasury = getTreasuryAddress()[0];
  const zincMint = Keypair.generate().publicKey;
  const buybackPoolAccounts = {
    poolAuthority: Keypair.generate().publicKey,
    pool: Keypair.generate().publicKey,
    tokenAVault: Keypair.generate().publicKey,
    tokenBVault: Keypair.generate().publicKey,
    eventAuthority: Keypair.generate().publicKey,
  };

  const instruction = await buildBuybackInstruction({
    connection: CONNECTION,
    signer,
    amountIn: 10n,
    minZincOut: 5n,
    zincMint,
    buybackPoolAccounts,
  });

  assert.equal(instruction.keys[0]?.pubkey.toBase58(), signer.toBase58());
  assert.equal(
    instruction.keys[1]?.pubkey.toBase58(),
    getConfigAddress()[0].toBase58(),
  );
  assert.equal(instruction.keys[2]?.pubkey.toBase58(), treasury.toBase58());
  assert.equal(
    instruction.keys[3]?.pubkey.toBase58(),
    getBuybackPoolAddress()[0].toBase58(),
  );
  assert.equal(
    instruction.keys[4]?.pubkey.toBase58(),
    WSOL_MINT_ADDRESS.toBase58(),
  );
  assert.equal(instruction.keys[5]?.pubkey.toBase58(), zincMint.toBase58());
  assert.equal(
    instruction.keys[6]?.pubkey.toBase58(),
    getClassicAtaAddress(treasury, WSOL_MINT_ADDRESS).toBase58(),
  );
  assert.equal(
    instruction.keys[7]?.pubkey.toBase58(),
    getBuybackZincTokenAccountAddress()[0].toBase58(),
  );
  assert.equal(
    instruction.keys[8]?.pubkey.toBase58(),
    getStakingRewardTokenAccountAddress()[0].toBase58(),
  );
  assert.equal(
    instruction.keys[9]?.pubkey.toBase58(),
    buybackPoolAccounts.poolAuthority.toBase58(),
  );
  assert.equal(
    instruction.keys[10]?.pubkey.toBase58(),
    buybackPoolAccounts.pool.toBase58(),
  );
  assert.equal(
    instruction.keys[11]?.pubkey.toBase58(),
    buybackPoolAccounts.tokenAVault.toBase58(),
  );
  assert.equal(
    instruction.keys[12]?.pubkey.toBase58(),
    buybackPoolAccounts.tokenBVault.toBase58(),
  );
  assert.equal(
    instruction.keys[13]?.pubkey.toBase58(),
    buybackPoolAccounts.eventAuthority.toBase58(),
  );
  assert.equal(instruction.keys[13]?.isWritable, false);
  assert.deepEqual(
    [...instruction.data.subarray(0, 8)],
    [106, 117, 64, 30, 56, 69, 7, 45],
  );
});

test("buildClaimBuybackPoolFeesInstruction targets dedicated fee custody", async () => {
  const admin = Keypair.generate().publicKey;
  const zincMint = Keypair.generate().publicKey;
  const buybackPoolAccounts = {
    poolAuthority: Keypair.generate().publicKey,
    pool: Keypair.generate().publicKey,
    position: Keypair.generate().publicKey,
    positionNftAccount: Keypair.generate().publicKey,
    tokenAVault: Keypair.generate().publicKey,
    tokenBVault: Keypair.generate().publicKey,
    eventAuthority: Keypair.generate().publicKey,
  };

  const instruction = await buildClaimBuybackPoolFeesInstruction({
    connection: CONNECTION,
    admin,
    zincMint,
    buybackPoolAccounts,
  });

  assert.equal(instruction.keys[0]?.pubkey.toBase58(), admin.toBase58());
  assert.equal(instruction.keys[0]?.isSigner, true);
  assert.equal(
    instruction.keys[1]?.pubkey.toBase58(),
    getConfigAddress()[0].toBase58(),
  );
  assert.equal(
    instruction.keys[3]?.pubkey.toBase58(),
    getBuybackPoolAddress()[0].toBase58(),
  );
  assert.equal(
    instruction.keys[4]?.pubkey.toBase58(),
    WSOL_MINT_ADDRESS.toBase58(),
  );
  assert.equal(instruction.keys[5]?.pubkey.toBase58(), zincMint.toBase58());
  assert.equal(
    instruction.keys[6]?.pubkey.toBase58(),
    getBuybackFeeZincTokenAccountAddress()[0].toBase58(),
  );
  assert.equal(instruction.keys[6]?.isWritable, true);
  assert.equal(
    instruction.keys[7]?.pubkey.toBase58(),
    getBuybackFeeWsolTokenAccountAddress()[0].toBase58(),
  );
  assert.equal(instruction.keys[7]?.isWritable, true);
  assert.equal(
    instruction.keys[8]?.pubkey.toBase58(),
    getClassicAtaAddress(admin, zincMint).toBase58(),
  );
  assert.equal(instruction.keys[8]?.isWritable, true);
  assert.equal(
    instruction.keys[9]?.pubkey.toBase58(),
    getClassicAtaAddress(admin, WSOL_MINT_ADDRESS).toBase58(),
  );
  assert.equal(instruction.keys[9]?.isWritable, true);
  assert.equal(
    instruction.keys[12]?.pubkey.toBase58(),
    buybackPoolAccounts.position.toBase58(),
  );
  assert.equal(instruction.keys[12]?.isWritable, true);
  assert.equal(
    instruction.keys[13]?.pubkey.toBase58(),
    buybackPoolAccounts.positionNftAccount.toBase58(),
  );
  assert.deepEqual(
    [...instruction.data.subarray(0, 8)],
    [124, 86, 221, 109, 203, 99, 227, 187],
  );
});

test("buildRemoveBuybackLiquidityInstruction targets dedicated LP custody", async () => {
  const admin = Keypair.generate().publicKey;
  const zincMint = Keypair.generate().publicKey;
  const buybackPoolAccounts = {
    poolAuthority: Keypair.generate().publicKey,
    pool: Keypair.generate().publicKey,
    position: Keypair.generate().publicKey,
    positionNftAccount: Keypair.generate().publicKey,
    tokenAVault: Keypair.generate().publicKey,
    tokenBVault: Keypair.generate().publicKey,
    eventAuthority: Keypair.generate().publicKey,
  };

  const instruction = await buildRemoveBuybackLiquidityInstruction({
    connection: CONNECTION,
    admin,
    zincMint,
    liquidityDelta: 42n,
    tokenAAmountThreshold: 7n,
    tokenBAmountThreshold: 9n,
    buybackPoolAccounts,
  });

  assert.equal(instruction.keys[0]?.pubkey.toBase58(), admin.toBase58());
  assert.equal(instruction.keys[0]?.isSigner, true);
  assert.equal(
    instruction.keys[3]?.pubkey.toBase58(),
    getBuybackPoolAddress()[0].toBase58(),
  );
  assert.equal(
    instruction.keys[4]?.pubkey.toBase58(),
    WSOL_MINT_ADDRESS.toBase58(),
  );
  assert.equal(instruction.keys[5]?.pubkey.toBase58(), zincMint.toBase58());
  assert.equal(
    instruction.keys[6]?.pubkey.toBase58(),
    getBuybackLpZincTokenAccountAddress()[0].toBase58(),
  );
  assert.equal(instruction.keys[6]?.isWritable, true);
  assert.equal(
    instruction.keys[7]?.pubkey.toBase58(),
    getBuybackLpWsolTokenAccountAddress()[0].toBase58(),
  );
  assert.equal(instruction.keys[7]?.isWritable, true);
  assert.equal(
    instruction.keys[10]?.pubkey.toBase58(),
    buybackPoolAccounts.position.toBase58(),
  );
  assert.equal(instruction.keys[10]?.isWritable, true);
  assert.equal(
    instruction.keys[11]?.pubkey.toBase58(),
    buybackPoolAccounts.positionNftAccount.toBase58(),
  );
  assert.deepEqual(
    [...instruction.data.subarray(0, 8)],
    [162, 33, 230, 119, 49, 191, 203, 163],
  );
});
