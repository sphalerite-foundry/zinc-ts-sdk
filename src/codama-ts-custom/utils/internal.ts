import { Connection, PublicKey } from "@solana/web3.js";
import {
  getBoardDecoder,
  getMXEAccountDecoder,
  type MXEAccount,
} from "../../codama-ts";
import { fetchDecodedAccount } from "../pda/shared";
import {
  fetchRoundAccount,
  getBoardAddress,
  type DecodedBoardAccount,
  type DecodedRoundAccount,
} from "../pda";

export type DecodedMxeAccount = {
  address: PublicKey;
  data: MXEAccount;
};

const ARCIUM_ACCOUNT_DISCRIMINATOR_SIZE = 8;

export async function fetchDecodedBoard(
  connection: Connection,
  programId: PublicKey,
): Promise<DecodedBoardAccount> {
  const [boardAddress] = getBoardAddress(programId);
  return fetchDecodedAccount(
    connection,
    boardAddress,
    getBoardDecoder(),
    "Board",
  );
}

export async function fetchDecodedRound(
  connection: Connection,
  roundAddress: PublicKey,
): Promise<DecodedRoundAccount> {
  return fetchRoundAccount(connection, roundAddress);
}

export async function fetchDecodedMxeAccount(
  connection: Connection,
  mxeAddress: PublicKey,
): Promise<DecodedMxeAccount> {
  const accountInfo = await connection.getAccountInfo(mxeAddress);

  if (!accountInfo) {
    throw new Error(`MXE account not found: ${mxeAddress.toBase58()}`);
  }

  return {
    address: mxeAddress,
    data: getMXEAccountDecoder().decode(
      accountInfo.data.slice(ARCIUM_ACCOUNT_DISCRIMINATOR_SIZE),
    ),
  };
}
