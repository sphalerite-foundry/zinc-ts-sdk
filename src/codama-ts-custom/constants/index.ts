import { PublicKey } from "@solana/web3.js";
import { ZINC_PROGRAM_ADDRESS } from "../../codama-ts";

export const CONFIG_SEED = "config";
export const BOARD_SEED = "board";
export const ROUND_SEED = "round";
export const ROUND_SECRET_SEED = "round-secret";
export const STOCKPILE_SEED = "stockpile";
export const STOCKPILE_SECRET_SEED = "stockpile-secret";
export const AFFILIATE_BINDING_SEED = "affiliate-binding";
export const AFFILIATE_LEDGER_SEED = "affiliate-ledger";
export const AFFILIATE_SOL_VAULT_SEED = "affiliate-sol-vault";
export const STOCKPILE_SOL_VAULT_SEED = "stockpile-sol-vault";
export const BUYBACK_SOL_VAULT_SEED = "buyback-sol-vault";
export const BUYBACK_POOL_SEED = "buyback-pool";
export const MINER_SEED = "miner";
export const ROUND_MINER_INDEX_SEED = "round-miner-index";
export const PLAYER_PROFILE_SEED = "player-profile";
export const TREASURY_SEED = "treasury";
export const STAKING_TOKEN_ACCOUNT_SEED = "staking-token-account";
export const STAKING_REWARD_TOKEN_ACCOUNT_SEED = "staking-reward-token-account";
export const BONANZA_TOKEN_ACCOUNT_SEED = "bonanza-token-account";
export const ROUND_ZINC_PAYOUT_TOKEN_ACCOUNT_SEED = "zinc-payout-token-account";
export const BUYBACK_TOKEN_ACCOUNT_SEED = "buyback-token-account";
export const BUYBACK_FEE_ZINC_TOKEN_ACCOUNT_SEED =
  "buyback-fee-zinc-token-account";
export const BUYBACK_FEE_WSOL_TOKEN_ACCOUNT_SEED =
  "buyback-fee-wsol-token-account";
export const METADATA_SEED = "metadata";
export const INIT_ROUND_RAND_CIRCUIT = "init_round_rand";
export const INIT_STOCKPILE_RAND_CIRCUIT = "init_stockpile_rand";
export const REVEAL_ROUND_RAND_CIRCUIT = "reveal_round_rand";
export const REVEAL_STOCKPILE_RAND_CIRCUIT = "reveal_stockpile_rand";
export const SETTLE_WINNING_STAKES_BATCH_CIRCUIT =
  "settle_winning_stakes_batch";
export const SETTLE_WINNING_STAKES_BATCH_SIZE = 8;
export const ZINC_PROGRAM_ID = new PublicKey(ZINC_PROGRAM_ADDRESS);
export const WSOL_MINT_ADDRESS = new PublicKey(
  "So11111111111111111111111111111111111111112"
);
export const METEORA_DAMM_V2_PROGRAM_ID = new PublicKey(
  "cpamdpZCGKUy5JxQXB4dcpGPiikHawvSWAd6mEn1sGG"
);
export const METEORA_DAMM_V2_PROGRAM_DATA_ADDRESS = new PublicKey(
  "AUh8bm2XsMfex3KjYGcM3G4uBqUNSDw6HEhWaWMYnyPH"
);
export const METEORA_STATIC_CONFIG_0002_ADDRESS = new PublicKey(
  "FzvMYBQ29z2J21QPsABpJYYxQBEKGsxA6w6J2HYceFj8"
);
export const METADATA_PROGRAM_ID = new PublicKey(
  "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
);
