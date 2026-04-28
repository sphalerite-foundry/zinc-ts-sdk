import { Connection, PublicKey } from "@solana/web3.js";
import { getBoardDecoder, type Board } from "../../codama-ts/accounts";
import { BOARD_SEED, ZINC_PROGRAM_ID } from "../constants";
import { fetchDecodedAccount, type DecodedAccount } from "./shared";

const TEXT_ENCODER = new TextEncoder();

export type DecodedBoardAccount = DecodedAccount<Board>;

export function getBoardAddress(
  programId: PublicKey = ZINC_PROGRAM_ID
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [TEXT_ENCODER.encode(BOARD_SEED)],
    programId
  );
}

export async function fetchBoardAccount(
  connection: Connection
): Promise<DecodedBoardAccount> {
  const boardAddress = getBoardAddress()[0];
  return fetchDecodedAccount(
    connection,
    boardAddress,
    getBoardDecoder(),
    "Board"
  );
}
