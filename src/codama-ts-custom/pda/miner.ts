import { Connection, PublicKey } from "@solana/web3.js";
import { getMinerDecoder, type Miner } from "../../codama-ts/accounts";
import { MINER_SEED, ZINC_PROGRAM_ID } from "../constants";
import { fetchDecodedAccount, type DecodedAccount } from "./shared";

const TEXT_ENCODER = new TextEncoder();

export type DecodedMinerAccount = DecodedAccount<Miner>;

function getRoundIdBytes(roundId: number | bigint): Uint8Array {
  const bytes = new Uint8Array(8);
  new DataView(bytes.buffer).setBigUint64(0, BigInt(roundId), true);
  return bytes;
}

export function getMinerAddress(
  roundId: number | bigint,
  player: PublicKey,
  programId: PublicKey = ZINC_PROGRAM_ID
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [
      TEXT_ENCODER.encode(MINER_SEED),
      getRoundIdBytes(roundId),
      player.toBytes(),
    ],
    programId
  );
}

export async function fetchMinerAccount(
  connection: Connection,
  minerAddress: PublicKey
): Promise<DecodedMinerAccount> {
  return fetchDecodedAccount(
    connection,
    minerAddress,
    getMinerDecoder(),
    "Miner"
  );
}
