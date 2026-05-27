import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddressSync,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import {
  Connection,
  PublicKey,
  SystemProgram,
  TransactionInstruction,
} from "@solana/web3.js";
import { Buffer } from "buffer";
import {
  getBuybackInstructionAsync,
  getRemoveBuybackLiquidityInstructionAsync,
} from "../../codama-ts";
import {
  METEORA_DAMM_V2_PROGRAM_ID,
  WSOL_MINT_ADDRESS,
  ZINC_PROGRAM_ID,
} from "../constants";
import {
  fetchBuybackPoolAccount,
  fetchTreasuryAccount,
  getBuybackPoolAddress,
  getBuybackFeeWsolTokenAccountAddress,
  getBuybackFeeZincTokenAccountAddress,
  getBuybackLpWsolTokenAccountAddress,
  getBuybackLpZincTokenAccountAddress,
  getConfigAddress,
  getTreasuryAddress,
} from "../pda";
import {
  toTransactionInstruction,
  toTransactionSigner,
} from "../utils/sol-helpers";
import { toAddress } from "./shared";

export type BuybackPoolInstructionAccounts = {
  /** Stored Meteora pool authority PDA. */
  poolAuthority: PublicKey;
  /** Stored Meteora pool account. */
  pool: PublicKey;
  /** Stored Meteora token A vault. */
  tokenAVault: PublicKey;
  /** Stored Meteora token B vault. */
  tokenBVault: PublicKey;
  /** Stored Meteora event authority PDA. */
  eventAuthority: PublicKey;
};

export type ClaimBuybackPoolFeesInstructionAccounts =
  BuybackPoolInstructionAccounts & {
    /** Stored Meteora liquidity position account. */
    position: PublicKey;
    /** Stored Meteora position NFT token account. */
    positionNftAccount: PublicKey;
  };

export type BuildBuybackInstruction = {
  connection: Connection;
  signer: PublicKey;
  amountIn: number | bigint;
  minZincOut: number | bigint;
  zincMint?: PublicKey;
  buybackPoolAccounts?: BuybackPoolInstructionAccounts;
};

export type BuildClaimBuybackPoolFeesInstruction = {
  connection: Connection;
  admin: PublicKey;
  zincMint?: PublicKey;
  buybackPoolAccounts?: ClaimBuybackPoolFeesInstructionAccounts;
};

export type BuildRemoveBuybackLiquidityInstruction = {
  connection: Connection;
  admin: PublicKey;
  liquidityDelta: number | bigint;
  tokenAAmountThreshold?: number | bigint;
  tokenBAmountThreshold?: number | bigint;
  zincMint?: PublicKey;
  buybackPoolAccounts?: ClaimBuybackPoolFeesInstructionAccounts;
};

const CLAIM_BUYBACK_POOL_FEES_DISCRIMINATOR = Buffer.from([
  124, 86, 221, 109, 203, 99, 227, 187,
]);

/** Loads the stored Meteora accounts when the caller does not provide them. */
async function resolveBuybackPoolInstructionAccounts(
  connection: Connection,
  buybackPoolAccounts?: BuybackPoolInstructionAccounts,
): Promise<BuybackPoolInstructionAccounts> {
  if (buybackPoolAccounts) {
    return buybackPoolAccounts;
  }

  const buybackPool = await fetchBuybackPoolAccount(
    connection,
    getBuybackPoolAddress()[0],
  );
  return {
    poolAuthority: new PublicKey(buybackPool.data.poolAuthority),
    pool: new PublicKey(buybackPool.data.pool),
    tokenAVault: new PublicKey(buybackPool.data.tokenAVault),
    tokenBVault: new PublicKey(buybackPool.data.tokenBVault),
    eventAuthority: new PublicKey(buybackPool.data.eventAuthority),
  };
}

/** Loads the stored Meteora fee-claim accounts when the caller does not provide them. */
async function resolveClaimBuybackPoolFeesInstructionAccounts(
  connection: Connection,
  buybackPoolAccounts?: ClaimBuybackPoolFeesInstructionAccounts,
): Promise<ClaimBuybackPoolFeesInstructionAccounts> {
  if (buybackPoolAccounts) {
    return buybackPoolAccounts;
  }

  const buybackPool = await fetchBuybackPoolAccount(
    connection,
    getBuybackPoolAddress()[0],
  );
  return {
    poolAuthority: new PublicKey(buybackPool.data.poolAuthority),
    pool: new PublicKey(buybackPool.data.pool),
    position: new PublicKey(buybackPool.data.position),
    positionNftAccount: new PublicKey(buybackPool.data.positionNftAccount),
    tokenAVault: new PublicKey(buybackPool.data.tokenAVault),
    tokenBVault: new PublicKey(buybackPool.data.tokenBVault),
    eventAuthority: new PublicKey(buybackPool.data.eventAuthority),
  };
}

/** Builds one keeper buyback instruction for the stored Meteora pool. */
export async function buildBuybackInstruction({
  connection,
  signer,
  amountIn,
  minZincOut,
  zincMint,
  buybackPoolAccounts,
}: BuildBuybackInstruction): Promise<TransactionInstruction> {
  const treasury = getTreasuryAddress()[0];
  let resolvedZincMint = zincMint;
  if (!resolvedZincMint) {
    const treasuryAccount = await fetchTreasuryAccount(connection, treasury);
    resolvedZincMint = new PublicKey(treasuryAccount.data.zincMint);
  }

  const poolAccounts = await resolveBuybackPoolInstructionAccounts(
    connection,
    buybackPoolAccounts,
  );
  const instruction = await getBuybackInstructionAsync({
    signer: toTransactionSigner(signer),
    treasury: toAddress(treasury),
    zincMint: toAddress(resolvedZincMint),
    poolAuthority: toAddress(poolAccounts.poolAuthority),
    pool: toAddress(poolAccounts.pool),
    tokenAVault: toAddress(poolAccounts.tokenAVault),
    tokenBVault: toAddress(poolAccounts.tokenBVault),
    eventAuthority: toAddress(poolAccounts.eventAuthority),
    amountIn,
    minZincOut,
  });
  return toTransactionInstruction(
    instruction as Parameters<typeof toTransactionInstruction>[0],
  );
}

/** Builds one instruction that claims buyback LP fees and forwards them to admin ATAs. */
export async function buildClaimBuybackPoolFeesInstruction({
  connection,
  admin,
  zincMint,
  buybackPoolAccounts,
}: BuildClaimBuybackPoolFeesInstruction): Promise<TransactionInstruction> {
  const config = getConfigAddress()[0];
  const treasury = getTreasuryAddress()[0];
  let resolvedZincMint = zincMint;
  if (!resolvedZincMint) {
    const treasuryAccount = await fetchTreasuryAccount(connection, treasury);
    resolvedZincMint = new PublicKey(treasuryAccount.data.zincMint);
  }

  const poolAccounts = await resolveClaimBuybackPoolFeesInstructionAccounts(
    connection,
    buybackPoolAccounts,
  );

  return new TransactionInstruction({
    programId: ZINC_PROGRAM_ID,
    keys: [
      { pubkey: admin, isSigner: true, isWritable: true },
      { pubkey: config, isSigner: false, isWritable: false },
      { pubkey: treasury, isSigner: false, isWritable: false },
      {
        pubkey: getBuybackPoolAddress()[0],
        isSigner: false,
        isWritable: false,
      },
      { pubkey: WSOL_MINT_ADDRESS, isSigner: false, isWritable: false },
      { pubkey: resolvedZincMint, isSigner: false, isWritable: false },
      {
        pubkey: getBuybackFeeZincTokenAccountAddress()[0],
        isSigner: false,
        isWritable: true,
      },
      {
        pubkey: getBuybackFeeWsolTokenAccountAddress()[0],
        isSigner: false,
        isWritable: true,
      },
      {
        pubkey: getAssociatedTokenAddressSync(
          resolvedZincMint,
          admin,
          false,
          TOKEN_PROGRAM_ID,
          ASSOCIATED_TOKEN_PROGRAM_ID,
        ),
        isSigner: false,
        isWritable: true,
      },
      {
        pubkey: getAssociatedTokenAddressSync(
          WSOL_MINT_ADDRESS,
          admin,
          false,
          TOKEN_PROGRAM_ID,
          ASSOCIATED_TOKEN_PROGRAM_ID,
        ),
        isSigner: false,
        isWritable: true,
      },
      {
        pubkey: poolAccounts.poolAuthority,
        isSigner: false,
        isWritable: false,
      },
      { pubkey: poolAccounts.pool, isSigner: false, isWritable: false },
      { pubkey: poolAccounts.position, isSigner: false, isWritable: true },
      {
        pubkey: poolAccounts.positionNftAccount,
        isSigner: false,
        isWritable: false,
      },
      { pubkey: poolAccounts.tokenAVault, isSigner: false, isWritable: true },
      { pubkey: poolAccounts.tokenBVault, isSigner: false, isWritable: true },
      {
        pubkey: poolAccounts.eventAuthority,
        isSigner: false,
        isWritable: false,
      },
      {
        pubkey: METEORA_DAMM_V2_PROGRAM_ID,
        isSigner: false,
        isWritable: false,
      },
      {
        pubkey: ASSOCIATED_TOKEN_PROGRAM_ID,
        isSigner: false,
        isWritable: false,
      },
      { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
    data: CLAIM_BUYBACK_POOL_FEES_DISCRIMINATOR,
  });
}

/** Builds one instruction that removes unlocked buyback LP principal into treasury custody. */
export async function buildRemoveBuybackLiquidityInstruction({
  connection,
  admin,
  liquidityDelta,
  tokenAAmountThreshold = 0n,
  tokenBAmountThreshold = 0n,
  zincMint,
  buybackPoolAccounts,
}: BuildRemoveBuybackLiquidityInstruction): Promise<TransactionInstruction> {
  const treasury = getTreasuryAddress()[0];
  let resolvedZincMint = zincMint;
  if (!resolvedZincMint) {
    const treasuryAccount = await fetchTreasuryAccount(connection, treasury);
    resolvedZincMint = new PublicKey(treasuryAccount.data.zincMint);
  }

  const poolAccounts = await resolveClaimBuybackPoolFeesInstructionAccounts(
    connection,
    buybackPoolAccounts,
  );
  const instruction = await getRemoveBuybackLiquidityInstructionAsync({
    admin: toTransactionSigner(admin),
    treasury: toAddress(treasury),
    zincMint: toAddress(resolvedZincMint),
    buybackLpZincTokenAccount: toAddress(
      getBuybackLpZincTokenAccountAddress()[0],
    ),
    buybackLpWsolTokenAccount: toAddress(
      getBuybackLpWsolTokenAccountAddress()[0],
    ),
    poolAuthority: toAddress(poolAccounts.poolAuthority),
    pool: toAddress(poolAccounts.pool),
    position: toAddress(poolAccounts.position),
    positionNftAccount: toAddress(poolAccounts.positionNftAccount),
    tokenAVault: toAddress(poolAccounts.tokenAVault),
    tokenBVault: toAddress(poolAccounts.tokenBVault),
    eventAuthority: toAddress(poolAccounts.eventAuthority),
    liquidityDelta,
    tokenAAmountThreshold,
    tokenBAmountThreshold,
  });
  return toTransactionInstruction(
    instruction as Parameters<typeof toTransactionInstruction>[0],
  );
}
