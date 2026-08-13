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
 * Resolves the authenticated user's id from the Supabase session. Throws
 * NotAuthenticatedError if there is no session.
 *
 * Deliberately does NOT touch Postgres. It used to (first an unconditional
 * upsert, then a findUnique-with-fallback-upsert after that was measured at
 * 86-258ms -- ~72% of this function's cost, on every request), but a real
 * Vercel measurement showed even the findUnique read wasn't free, and the
 * actual per-user `users` row provisioning already happens exactly once, at
 * signup (see auth-actions.ts's `signup()`) -- there's no need to re-verify
 * it exists on every single authenticated request afterward. Prisma
 * `User.id` mirrors the Supabase auth uid by convention (documented in
 * schema.prisma); `user.id` here comes straight from Supabase's own
 * signature-verified session, never from anything client-supplied, so this
 * is not a trust boundary change -- it's the same identity, just no longer
 * re-confirmed against a table that signup() already populated.
 *
 * Safety net for the row still somehow being missing (e.g. a pre-signup()
 * legacy account, or manual DB tampering): every write that depends on a
 * `users` row existing goes through a real Postgres foreign key (e.g.
 * QuizAttempt.userId -> User.id), so a missing row fails the write cleanly
 * instead of silently succeeding under the wrong identity. finalizeAttempt
 * in grammar-actions.ts catches that specific failure (Prisma P2003) and
 * self-heals via provisionUserRow() below, once, before giving up.
 */
export const requireUserId = cache(async (): Promise<string> => {
  // TEMP-DIAGNOSTIC: remove both [TIMING] lines once the user has confirmed
  // from Vercel logs that this eliminated the DB round trip from the hot
  // path (i.e. requireUserId()'s total time now ≈ getUser()'s alone).
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

  return user.id;
});

/**
 * Provisions (or repairs) the `users` row for a given, already-verified
 * user id. Not on the normal request path -- see requireUserId() above.
 * Called only as a one-time self-heal when a write fails on the User FK
 * (Prisma P2003), which should be rare: signup() provisions this row at
 * account creation, and the one known pre-signup()-era orphaned row has
 * been fixed directly in the DB.
 */
export async function provisionUserRow(userId: string): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  await prisma.user.upsert({
    where: { id: userId },
    update: {},
    create: {
      id: userId,
      email: user?.email ?? "",
    },
  });
}
