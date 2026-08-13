import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export class NotAuthenticatedError extends Error {
  constructor() {
    super("Not authenticated");
    this.name = "NotAuthenticatedError";
  }
}

/**
 * Resolves the authenticated user's id from the Supabase session and ensures
 * a matching row exists in the app's `users` table (Prisma `User.id` must
 * always equal the Supabase `auth.users.id` — there is no DB trigger syncing
 * them, so this is the sync point). Throws NotAuthenticatedError if there is
 * no session; other errors (e.g. the DB call failing) propagate as-is so
 * callers can tell "not signed in" apart from "database error".
 *
 * The split [TIMING] measurement below (real Vercel numbers) showed
 * createClient() costs ~0ms, getUser() costs 20-62ms (a real network call
 * to Supabase's Auth server), and the previous unconditional
 * `prisma.user.upsert()` cost 86-258ms -- ~72% of the whole function, on
 * every single authenticated request, for a user whose row has existed for
 * months. Row creation only needs to happen once, ever, per user, so this
 * is now a findUnique (cheap primary-key read) on the hot path, falling
 * back to upsert -- not a plain create -- only when the row is actually
 * missing, so two concurrent first-requests from a brand-new user can't
 * crash on a duplicate-key error racing each other.
 */
export const requireUserId = cache(async (): Promise<string> => {
  // TEMP-DIAGNOSTIC: remove all [TIMING] lines below once the user has
  // measured the findUnique path and confirmed it resolved the upsert cost.
  const createClientStart = performance.now();
  const supabase = await createClient();
  console.log(`[TIMING] createClient(): ${(performance.now() - createClientStart).toFixed(1)}ms`);

  const getUserStart = performance.now();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  console.log(`[TIMING] getUser(): ${(performance.now() - getUserStart).toFixed(1)}ms`);

  if (!user) {
    throw new NotAuthenticatedError();
  }

  const ensureRowStart = performance.now();
  const existingUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { id: true },
  });
  if (!existingUser) {
    // Race-safe: if another concurrent request from this same brand-new
    // user already created the row between the findUnique above and here,
    // upsert's ON CONFLICT DO UPDATE absorbs that instead of crashing on a
    // duplicate-key error the way a plain create would.
    await prisma.user.upsert({
      where: { id: user.id },
      update: {},
      create: {
        id: user.id,
        email: user.email ?? "",
      },
    });
  }
  console.log(
    `[TIMING] ensureUserRow() (findUnique${existingUser ? "" : " + upsert (new user)"}): ${(performance.now() - ensureRowStart).toFixed(1)}ms`
  );

  return user.id;
});
