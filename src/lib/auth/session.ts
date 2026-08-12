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
 * Wrapped in React cache(): per Vercel logs, the cost here isn't a network
 * round trip (Supabase's own auth logs show zero token-verification requests
 * across repeated page loads -- getUser() validates the JWT locally), it's
 * the JWT verification + cookie parsing + client construction work itself,
 * which was running fresh on every one of the several times a single page
 * render calls requireUserId(). cache() is per-request only, so this can't
 * leak one user's id to another request.
 */
export const requireUserId = cache(async (): Promise<string> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new NotAuthenticatedError();
  }

  await prisma.user.upsert({
    where: { id: user.id },
    update: {},
    create: {
      id: user.id,
      email: user.email ?? "",
    },
  });

  return user.id;
});
