import { mockAuth } from "./mock";
import type { AuthProvider, Session } from "./types";

/**
 * Selects the auth adapter via the AUTH_PROVIDER env switch. Only the mock
 * adapter exists today; Clerk is wired in Phase 18 and falls back to mock when
 * its keys are missing.
 */
export function getAuthProvider(): AuthProvider {
  // TODO(phase-18): return clerkAuth when AUTH_PROVIDER === "clerk" and keys present.
  return mockAuth;
}

export const auth = getAuthProvider();

export async function getSession(): Promise<Session> {
  return auth.getSession();
}

export * from "./types";
