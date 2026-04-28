import { Connection, PublicKey } from "@solana/web3.js";
import {
  getPlayerProfileDecoder,
  type PlayerProfile as CanonicalPlayerProfile,
} from "../../codama-ts/accounts";
import { PLAYER_PROFILE_SEED, ZINC_PROGRAM_ID } from "../constants";
import { fetchDecodedAccount, type DecodedAccount } from "./shared";

const TEXT_ENCODER = new TextEncoder();

export type PlayerProfile = CanonicalPlayerProfile;
export type DecodedPlayerProfileAccount = DecodedAccount<PlayerProfile>;

/** Derives one player-profile PDA for the provided wallet. */
export function getPlayerProfileAddress(
  player: PublicKey,
  programId: PublicKey = ZINC_PROGRAM_ID
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [TEXT_ENCODER.encode(PLAYER_PROFILE_SEED), player.toBytes()],
    programId
  );
}

/** Fetches and decodes one player-profile account. */
export async function fetchPlayerProfileAccount(
  connection: Connection,
  playerProfileAddress: PublicKey
): Promise<DecodedPlayerProfileAccount> {
  return fetchDecodedAccount(
    connection,
    playerProfileAddress,
    getPlayerProfileDecoder(),
    "PlayerProfile"
  );
}
