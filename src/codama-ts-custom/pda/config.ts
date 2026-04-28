import { Connection, PublicKey } from "@solana/web3.js";
import {
  getConfigDecoder,
  type Config as CanonicalConfig,
} from "../../codama-ts/accounts";
import { CONFIG_SEED, ZINC_PROGRAM_ID } from "../constants";
import { fetchDecodedAccount, type DecodedAccount } from "./shared";

const TEXT_ENCODER = new TextEncoder();

export type Config = CanonicalConfig;
export type ConfigAccountData = Config;
export type DecodedConfigAccount = DecodedAccount<Config>;

/** Derives the singleton config PDA. */
export function getConfigAddress(
  programId: PublicKey = ZINC_PROGRAM_ID
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [TEXT_ENCODER.encode(CONFIG_SEED)],
    programId
  );
}

/** Fetches and decodes the singleton config account. */
export async function fetchConfigAccount(
  connection: Connection
): Promise<DecodedConfigAccount> {
  const configAddress = getConfigAddress()[0];
  return fetchDecodedAccount(
    connection,
    configAddress,
    getConfigDecoder(),
    "Config"
  );
}
