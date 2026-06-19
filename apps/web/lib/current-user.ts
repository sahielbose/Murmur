import { eq, getDb, users, type User } from "@murmur/db";
import { getSession } from "@/lib/auth";

/**
 * Bridge the (mock) session to a Drizzle user row, keyed by email. Creates the
 * row on first use so a signed-in session always maps to a persisted user. With
 * the seed in place, the dev user (alex@murmur.app) resolves to the seeded row.
 */
export async function getDbUser(): Promise<User | null> {
  const session = await getSession();
  if (!session) return null;

  const db = getDb();
  const [existing] = await db
    .select()
    .from(users)
    .where(eq(users.email, session.user.email))
    .limit(1);
  if (existing) return existing;

  // Idempotent create: concurrent first-requests for a new email race on the
  // unique(email) constraint, so no-op on conflict and re-select the winner.
  const [created] = await db
    .insert(users)
    .values({
      email: session.user.email,
      name: session.user.name,
      plan: session.user.plan,
    })
    .onConflictDoNothing({ target: users.email })
    .returning();
  if (created) return created;

  const [row] = await db
    .select()
    .from(users)
    .where(eq(users.email, session.user.email))
    .limit(1);
  return row ?? null;
}

export async function requireDbUser(): Promise<User> {
  const user = await getDbUser();
  if (!user) throw new Error("unauthorized");
  return user;
}
