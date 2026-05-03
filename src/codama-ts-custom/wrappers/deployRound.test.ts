import assert from "node:assert/strict";
import { test } from "node:test";
import { address } from "@solana/kit";
import {
  Keypair,
  PublicKey,
  type AccountInfo,
  type Connection,
} from "@solana/web3.js";
import { getBoardEncoder, getPlayerProfileEncoder } from "../../codama-ts";
import {
  getBoardAddress,
  getPlayerProfileAddress,
  getRoundAddress,
  getStockpileAddress,
} from "../pda";
import { ZINC_PROGRAM_ID } from "../constants";
import { buildDeployRoundInstruction } from "./deployRound";

const ROUND_ID = 22n;
const TOTAL_AMOUNT = 1_000_000_000n;
const MASK_ENCRYPTION_KEY = new Uint8Array(32);
const MASK_NONCE = 9n;
const MASK_CIPHERTEXT = new Uint8Array(64);

type FakeConnectionInputs = {
  signer: PublicKey;
  affiliate?: PublicKey | null;
  activeStockpileId?: bigint | null;
  unresolvedStockpileId?: bigint | null;
  nextStockpileId?: bigint;
};

function encodeBoardAccount({
  activeStockpileId = 1n,
  unresolvedStockpileId = null,
  nextStockpileId = 2n,
}: Pick<
  FakeConnectionInputs,
  "activeStockpileId" | "unresolvedStockpileId" | "nextStockpileId"
> = {}): Buffer {
  const crankAuthority = Keypair.generate().publicKey;
  return Buffer.from(
    getBoardEncoder().encode({
      activeRoundId: null,
      activeStockpileId,
      unresolvedStockpileId,
      waitingRoundId: ROUND_ID,
      nextRoundId: ROUND_ID + 1n,
      nextStockpileId,
      crankAuthority: address(crankAuthority.toBase58()),
      bump: getBoardAddress()[1],
    }),
  );
}

function encodePlayerProfileAccount({
  signer,
  affiliate,
}: FakeConnectionInputs): Buffer {
  return Buffer.from(
    getPlayerProfileEncoder().encode({
      player: address(signer.toBase58()),
      initialized: true,
      roundsCount: 1n,
      lastStreakRound: 1n,
      currentStreakRound: 1n,
      currentStreakCount: 1n,
      grossDeployedLamports: TOTAL_AMOUNT,
      netDeployedLamports: TOTAL_AMOUNT,
      affiliate: affiliate ? address(affiliate.toBase58()) : null,
      pendingAffiliatePayLamports: 0n,
      totalAffiliatePayLamports: 0n,
      lifetimeStockpileBricksEarnedX10k: 0n,
      lifetimeStakingStockpileBricksEarnedX10k: 0n,
      lifetimeStreakStockpileBricksEarnedX10k: 0n,
      lifetimeHiddenBonusStockpileBricksEarnedX10k: 0n,
      availableStockpileBricksX10k: 0n,
      claimableRoundZincRewards: 0n,
      refinedRoundZincRewards: 0n,
      roundZincRewardsFactorCheckpoint: 0n,
      lifetimeRoundZincRewards: 0n,
      lastJoinedStockpileId: null,
      bump: getPlayerProfileAddress(signer)[1],
    }),
  );
}

function createFakeConnection(input: FakeConnectionInputs): Connection {
  const { signer, affiliate } = input;
  const accounts = new Map<string, Buffer>([
    [getBoardAddress()[0].toBase58(), encodeBoardAccount(input)],
    [
      getPlayerProfileAddress(signer)[0].toBase58(),
      encodePlayerProfileAccount({ signer, affiliate }),
    ],
  ]);

  return {
    getAccountInfo: async (pubkey: PublicKey) => {
      const data = accounts.get(pubkey.toBase58());
      if (!data) {
        return null;
      }
      return { data } as AccountInfo<Buffer>;
    },
  } as unknown as Connection;
}

async function buildInstructionWithAffiliateState({
  signer,
  storedAffiliate,
  requestedAffiliate,
  activeStockpileId,
  unresolvedStockpileId,
  nextStockpileId,
}: {
  signer: PublicKey;
  storedAffiliate?: PublicKey | null;
  requestedAffiliate?: PublicKey | null;
  activeStockpileId?: bigint | null;
  unresolvedStockpileId?: bigint | null;
  nextStockpileId?: bigint;
}) {
  const connection = createFakeConnection({
    signer,
    affiliate: storedAffiliate,
    activeStockpileId,
    unresolvedStockpileId,
    nextStockpileId,
  });
  return buildDeployRoundInstruction({
    connection,
    signer,
    affiliate: requestedAffiliate,
    roundId: ROUND_ID,
    totalAmount: TOTAL_AMOUNT,
    maskEncryptionKey: MASK_ENCRYPTION_KEY,
    maskNonce: MASK_NONCE,
    maskCiphertext: MASK_CIPHERTEXT,
  });
}

test("buildDeployRoundInstruction uses a referral for an existing unbound profile", async () => {
  const signer = Keypair.generate().publicKey;
  const requestedAffiliate = Keypair.generate().publicKey;
  const instruction = await buildInstructionWithAffiliateState({
    signer,
    storedAffiliate: null,
    requestedAffiliate,
  });

  assert.equal(
    instruction.keys[10]?.pubkey.toBase58(),
    requestedAffiliate.toBase58(),
  );
  assert.equal(
    instruction.keys[11]?.pubkey.toBase58(),
    getPlayerProfileAddress(requestedAffiliate)[0].toBase58(),
  );
});

test("buildDeployRoundInstruction omits a requested self-referral", async () => {
  const signer = Keypair.generate().publicKey;
  const instruction = await buildInstructionWithAffiliateState({
    signer,
    storedAffiliate: null,
    requestedAffiliate: signer,
  });

  assert.equal(
    instruction.keys[10]?.pubkey.toBase58(),
    ZINC_PROGRAM_ID.toBase58(),
  );
  assert.equal(
    instruction.keys[11]?.pubkey.toBase58(),
    ZINC_PROGRAM_ID.toBase58(),
  );
});

test("buildDeployRoundInstruction reuses a stored affiliate when none is requested", async () => {
  const signer = Keypair.generate().publicKey;
  const storedAffiliate = Keypair.generate().publicKey;
  const instruction = await buildInstructionWithAffiliateState({
    signer,
    storedAffiliate,
    requestedAffiliate: null,
  });

  assert.equal(
    instruction.keys[10]?.pubkey.toBase58(),
    storedAffiliate.toBase58(),
  );
  assert.equal(
    instruction.keys[11]?.pubkey.toBase58(),
    getPlayerProfileAddress(storedAffiliate)[0].toBase58(),
  );
});

test("buildDeployRoundInstruction omits a stored self-referral", async () => {
  const signer = Keypair.generate().publicKey;
  const instruction = await buildInstructionWithAffiliateState({
    signer,
    storedAffiliate: signer,
    requestedAffiliate: null,
  });

  assert.equal(
    instruction.keys[10]?.pubkey.toBase58(),
    ZINC_PROGRAM_ID.toBase58(),
  );
  assert.equal(
    instruction.keys[11]?.pubkey.toBase58(),
    ZINC_PROGRAM_ID.toBase58(),
  );
});

test("buildDeployRoundInstruction passes a different referral through for program rejection", async () => {
  const signer = Keypair.generate().publicKey;
  const storedAffiliate = Keypair.generate().publicKey;
  const requestedAffiliate = Keypair.generate().publicKey;
  const instruction = await buildInstructionWithAffiliateState({
    signer,
    storedAffiliate,
    requestedAffiliate,
  });

  assert.equal(
    instruction.keys[10]?.pubkey.toBase58(),
    requestedAffiliate.toBase58(),
  );
  assert.equal(
    instruction.keys[11]?.pubkey.toBase58(),
    getPlayerProfileAddress(requestedAffiliate)[0].toBase58(),
  );
});

test("buildDeployRoundInstruction derives the requested round account", async () => {
  const signer = Keypair.generate().publicKey;
  const instruction = await buildInstructionWithAffiliateState({
    signer,
    storedAffiliate: null,
    requestedAffiliate: null,
  });

  assert.equal(
    instruction.keys[1]?.pubkey.toBase58(),
    getRoundAddress(ROUND_ID)[0].toBase58(),
  );
  assert.equal(
    instruction.keys[4]?.pubkey.toBase58(),
    getPlayerProfileAddress(signer)[0].toBase58(),
  );
});

test("buildDeployRoundInstruction falls back to the latest initialized stockpile between cycles", async () => {
  const signer = Keypair.generate().publicKey;
  const instruction = await buildInstructionWithAffiliateState({
    signer,
    storedAffiliate: null,
    requestedAffiliate: null,
    activeStockpileId: null,
    unresolvedStockpileId: null,
    nextStockpileId: 4n,
  });

  assert.equal(
    instruction.keys[9]?.pubkey.toBase58(),
    getStockpileAddress(3n)[0].toBase58(),
  );
});

test("buildDeployRoundInstruction rejects deploy before any stockpile exists", async () => {
  const signer = Keypair.generate().publicKey;

  await assert.rejects(
    buildInstructionWithAffiliateState({
      signer,
      storedAffiliate: null,
      requestedAffiliate: null,
      activeStockpileId: null,
      unresolvedStockpileId: null,
      nextStockpileId: 0n,
    }),
    /no initialized stockpile account/,
  );
});
