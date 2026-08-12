import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

// Grammar content (lessons/quizzes) is cached indefinitely via
// unstable_cache with tags: ['grammar-content'] in grammar-actions.ts --
// it only changes when someone re-seeds the DB, so it's invalidated
// explicitly rather than on a timer. Called from scripts/seed-grammar.ts
// after a successful seed (see triggerRevalidation there), or manually:
//
//   curl -X POST https://<deployment>/api/revalidate-grammar \
//     -H "Authorization: Bearer $REVALIDATE_SECRET"
//
// Requires REVALIDATE_SECRET to be set in the deployment's env vars --
// without it, this route refuses every request (fails closed, matching
// how auth is handled elsewhere in this app).
export async function POST(request: NextRequest) {
  const expected = process.env.REVALIDATE_SECRET;
  if (!expected) {
    return NextResponse.json({ error: "REVALIDATE_SECRET is not configured" }, { status: 500 });
  }

  const provided = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (provided !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  revalidateTag("grammar-content");
  return NextResponse.json({ revalidated: true, tag: "grammar-content", now: Date.now() });
}
