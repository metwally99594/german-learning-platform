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
 * them, so this upsert is the sync point). Throws NotAuthenticatedError if
 * there is no session; other errors (e.g. the upsert failing) propagate as-is
 * so callers can tell "not signed in" apart from "database error".
 *
 * Wrapped in React cache() -- per-request only, can't leak one user's id to
 * another request. That alone didn't reduce the measured ~130ms, and a
 * revised measurement showed getUser() itself only costs 3-5ms (it IS a
 * real network call to Supabase's Auth server, confirmed via GET /user in
 * Supabase's logs -- an earlier claim that it verified the JWT locally with
 * zero network calls was wrong, based on an overly narrow log filter). So
 * the previous single [TIMING] line around this whole function was
 * conflating three different costs into one number. Split below so the
 * real source of the remaining ~127ms is unambiguous instead of guessed at.
 */
export const requireUserId = cache(async (): Promise<string> => {
  // TEMP-DIAGNOSTIC: remove all three lines below once the split numbers
  // are in and the actual bottleneck (createClient / getUser / the upsert)
  // is confirmed.
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

  const upsertStart = performance.now();
  await prisma.user.upsert({
    where: { id: user.id },
    update: {},
    create: {
      id: user.id,
      email: user.email ?? "",
    },
  });
  console.log(`[TIMING] prisma.user.upsert(): ${(performance.now() - upsertStart).toFixed(1)}ms`);

  return user.id;
});
