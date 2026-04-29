import { PublicKey } from "@solana/web3.js";
import { METADATA_PROGRAM_ID, METADATA_SEED } from "../constants";

const TEXT_ENCODER = new TextEncoder();

/** Derives the Metaplex metadata PDA attached to one mint. */
export function getMintMetadataAddress(
  mint: PublicKey,
  metadataProgramId: PublicKey = METADATA_PROGRAM_ID,
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [
      TEXT_ENCODER.encode(METADATA_SEED),
      metadataProgramId.toBuffer(),
      mint.toBuffer(),
    ],
    metadataProgramId,
  );
}
