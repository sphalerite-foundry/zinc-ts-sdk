import { resolveCompDefSource as resolveConfiguredCompDefSource } from "../utils/node";

/** Resolves one computation-definition circuit source URL for setup flows. */
export function resolveCompDefSource(
  circuitName: string,
  source?: string
): string {
  return resolveConfiguredCompDefSource(circuitName, source);
}
