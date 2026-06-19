"use server";

import { redirect } from "next/navigation";
import { auth } from "./index";

/** Dev sign-in: sets the mock session cookie and lands in the app. */
export async function devSignIn(formData: FormData) {
  const email = (formData.get("email") as string | null)?.trim();
  const name = (formData.get("name") as string | null)?.trim() || undefined;
  // Never silently fall back to the seeded identity on a blank submit.
  if (!email) {
    redirect("/login?error=email-required");
  }
  await auth.signIn({ email, name });
  redirect("/app");
}

/** Dev sign-out: clears the session and returns to the marketing site. */
export async function devSignOut() {
  await auth.signOut();
  redirect("/");
}
