import { address, isSome, type Address, type Option } from "@solana/kit";
import { PublicKey } from "@solana/web3.js";

/** Classic SPL Associated Token Program address. */
export const ASSOCIATED_TOKEN_PROGRAM_ID = new PublicKey(
  "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
);
const TOKEN_PROGRAM_ID = new PublicKey(
  "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
);

/** Converts one `PublicKey` into the codama `Address` wire format. */
export function toAddress(pubkey: PublicKey): Address {
  return address(pubkey.toBase58());
}

/** Derives the classic SPL associated token account for one owner and mint. */
export function getClassicAtaAddress(
  owner: PublicKey,
  mint: PublicKey
): PublicKey {
  return PublicKey.findProgramAddressSync(
    [owner.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), mint.toBuffer()],
    ASSOCIATED_TOKEN_PROGRAM_ID
  )[0];
}

/** Returns the inner value when a Codama `Option<T>` is `Some`, otherwise `undefined`. */
export function unwrapOption<T>(option: Option<T>): T | undefined {
  return isSome(option) ? option.value : undefined;
}

/** Converts an optional JavaScript value into the nullable input Codama encoders accept. */
export function toNullable<T>(value: T | undefined): T | null {
  return value ?? null;
}

/** Resolves the optional Arcium cluster offset with an environment fallback. */
export function resolveArciumClusterOffset(
  arciumClusterOffset?: number
): number {
  if (arciumClusterOffset !== undefined) {
    return arciumClusterOffset;
  }

  const rawClusterOffset = process.env.ARCIUM_CLUSTER_OFFSET;
  if (!rawClusterOffset) {
    return 0;
  }

  const parsedClusterOffset = Number(rawClusterOffset);
  if (Number.isNaN(parsedClusterOffset)) {
    throw new Error(
      `ARCIUM_CLUSTER_OFFSET environment variable is invalid (${rawClusterOffset})`
    );
  }

  return parsedClusterOffset;
}
