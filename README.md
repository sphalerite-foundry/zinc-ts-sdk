# Zinc TypeScript SDK

TypeScript SDK for the Zinc protocol.

This package includes the generated Codama TypeScript client and handwritten
Zinc PDA, instruction, and utility wrappers.

## Publication Posture

This repository is intended for source-visible public review from a clean
reviewed import. Existing private history should not be made public unless a
separate history scan and human approval explicitly allow it.

The package is rights reserved and keeps `"license": "UNLICENSED"`. npm
publishing is out of scope for the initial public source release.

## Environment Variables

The SDK reads only optional public configuration values:

- `ARCIUM_CLUSTER_OFFSET`
- `ZINC_CIRCUIT_SOURCE_BASE_URL`
- `ZINC_CIRCUIT_SOURCE_MANIFEST_PATH`
- `R2_PUBLIC_BASE_URL`
- `ZINC_URGENT_COMPUTE_UNIT_PRICE_MICRO_LAMPORTS`
- `ZINC_BACKGROUND_COMPUTE_UNIT_PRICE_MICRO_LAMPORTS`
- `ZINC_COMPUTE_UNIT_PRICE_MICRO_LAMPORTS`

Do not commit `.env` files, RPC URLs containing API keys, keypair JSON, wallet
files, private keys, or seed phrases to this repository.
