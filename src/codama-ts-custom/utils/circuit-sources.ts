import * as fs from "fs";
import * as path from "path";
import { Buffer } from "buffer";

const DEFAULT_COMP_DEF_SOURCE_BASE_URL = "https://example.invalid";
const DEFAULT_CIRCUIT_MANIFEST_PATH = "config/circuits.json";
const CIRCUIT_OBJECT_PREFIX = "circuits";

type CircuitManifest = {
  circuits: CircuitManifestEntry[];
};

type CircuitManifestEntry = {
  name: string;
  artifactPath: string;
  hashPath: string;
};

export type PublishedCircuit = {
  name: string;
  artifactPath: string;
  hashPath: string;
  hash: Uint8Array;
  hashHex: string;
  objectKey: string;
  publicUrl: string;
};

export function resolveCompDefSource(
  circuitName: string,
  source?: string
): string {
  if (source) {
    return source;
  }

  const baseUrl = resolveConfiguredCircuitSourceBaseUrl();
  if (!baseUrl) {
    return `${DEFAULT_COMP_DEF_SOURCE_BASE_URL}/${circuitName}.arcis`;
  }

  return resolvePublishedCircuit(circuitName, { baseUrl }).publicUrl;
}

export function resolvePublishedCircuit(
  circuitName: string,
  options?: {
    baseUrl?: string;
    manifestPath?: string;
  }
): PublishedCircuit {
  const baseUrl = normalizeBaseUrl(
    options?.baseUrl ?? resolveConfiguredCircuitSourceBaseUrl()
  );
  if (!baseUrl) {
    throw new Error(
      "Missing circuit source base URL. Set ZINC_CIRCUIT_SOURCE_BASE_URL or R2_PUBLIC_BASE_URL."
    );
  }

  const manifestPath = resolveManifestPath(options?.manifestPath);
  const manifest = loadCircuitManifest(manifestPath);
  const circuit = manifest.circuits.find((entry) => entry.name === circuitName);

  if (!circuit) {
    throw new Error(`Circuit ${circuitName} is missing from ${manifestPath}.`);
  }

  const hashPath = path.resolve(process.cwd(), circuit.hashPath);
  const hash = readCircuitHash(hashPath);
  const hashHex = hexEncode(hash);
  const objectKey = `${CIRCUIT_OBJECT_PREFIX}/${hashHex}.arcis`;

  return {
    name: circuit.name,
    artifactPath: path.resolve(process.cwd(), circuit.artifactPath),
    hashPath,
    hash,
    hashHex,
    objectKey,
    publicUrl: `${baseUrl}/${objectKey}`,
  };
}

export function resolveConfiguredCircuitSourceBaseUrl(): string | null {
  return normalizeBaseUrl(
    process.env.ZINC_CIRCUIT_SOURCE_BASE_URL ??
      process.env.R2_PUBLIC_BASE_URL ??
      null
  );
}

function resolveManifestPath(manifestPath?: string): string {
  const raw =
    manifestPath?.trim() ||
    process.env.ZINC_CIRCUIT_SOURCE_MANIFEST_PATH?.trim() ||
    DEFAULT_CIRCUIT_MANIFEST_PATH;
  return path.resolve(process.cwd(), raw);
}

function loadCircuitManifest(manifestPath: string): CircuitManifest {
  const contents = fs.readFileSync(manifestPath, "utf8");
  const manifest = JSON.parse(contents) as Partial<CircuitManifest>;

  if (!Array.isArray(manifest.circuits) || manifest.circuits.length === 0) {
    throw new Error(
      `Circuit manifest ${manifestPath} must contain at least one circuit.`
    );
  }

  return manifest as CircuitManifest;
}

function readCircuitHash(hashPath: string): Uint8Array {
  const contents = fs.readFileSync(hashPath, "utf8");
  const parsed = JSON.parse(contents) as unknown;

  if (!Array.isArray(parsed) || parsed.length !== 32) {
    throw new Error(`${hashPath} must contain exactly 32 bytes.`);
  }

  const bytes = Uint8Array.from(parsed);
  if (bytes.length !== 32) {
    throw new Error(`${hashPath} must decode to exactly 32 bytes.`);
  }

  return bytes;
}

function normalizeBaseUrl(baseUrl: string | null | undefined): string | null {
  const trimmed = baseUrl?.trim();
  if (!trimmed) {
    return null;
  }

  return trimmed.replace(/\/+$/, "");
}

function hexEncode(bytes: Uint8Array): string {
  return Buffer.from(bytes).toString("hex");
}
