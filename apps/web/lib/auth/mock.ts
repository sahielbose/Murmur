import { cookies } from "next/headers";
import type { AuthProvider, Session, SessionUser } from "./types";

const COOKIE = "murmur_dev_session";

const DEV_USER: SessionUser = {
  id: "dev-user",
  name: "Alex Rivera",
  email: "alex@murmur.app",
  plan: "free",
};

/**
 * Deterministic cookie-backed dev session. Reading works in any server
 * component; writing (signIn/signOut) must run inside a Server Action or Route
 * Handler.
 */
export const mockAuth: AuthProvider = {
  async getSession(): Promise<Session> {
    const store = await cookies();
    const raw = store.get(COOKIE)?.value;
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw) as Partial<SessionUser>;
      return { user: { ...DEV_USER, ...parsed } };
    } catch {
      return { user: DEV_USER };
    }
  },

  async signIn(input): Promise<SessionUser> {
    const store = await cookies();
    const user: SessionUser = {
      ...DEV_USER,
      email: input?.email?.trim() || DEV_USER.email,
      name: input?.name?.trim() || DEV_USER.name,
    };
    store.set(COOKIE, JSON.stringify({ email: user.email, name: user.name }), {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
    return user;
  },

  async signOut(): Promise<void> {
    const store = await cookies();
    store.delete(COOKIE);
  },
};
