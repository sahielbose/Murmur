export type Plan = "free" | "pro" | "enterprise";

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  plan: Plan;
};

export type Session = { user: SessionUser } | null;

/**
 * Auth seam (MURMUR_CONTEXT.md §5). The mock adapter ships a cookie-backed dev
 * session; the real adapter (Clerk) is wired in Phase 18 with a mock fallback.
 */
export interface AuthProvider {
  getSession(): Promise<Session>;
  signIn(input?: { email?: string; name?: string }): Promise<SessionUser>;
  signOut(): Promise<void>;
}
