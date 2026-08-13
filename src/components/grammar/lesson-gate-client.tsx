"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getLessonLockInfo, type LessonLockInfo } from "@/server/actions/grammar-actions";

export type LessonGateClientProps = {
  levelCode: string;
  prerequisiteSlug: string | null;
  children: React.ReactNode;
};

// The server-rendered/static counterpart to LessonGate: used on the statically
// generated lesson page, where the page itself must stay free of
// cookies()/requireUserId() so Next can prerender it. The lock check runs
// client-side on mount instead, via the getLessonLockInfo server action.
//
// Note: `children` (the actual lesson content) is still part of the static
// HTML/RSC payload regardless of lock state -- this component only controls
// what's *displayed*, not what's *sent*. That's an intentional, disclosed
// tradeoff for lesson content specifically (teaching material, not secret --
// unlike quiz answers, which stay behind the fully-dynamic LessonGate on the
// quiz page and are never resolved server-side while locked).
export function LessonGateClient({ levelCode, prerequisiteSlug, children }: LessonGateClientProps) {
  const [status, setStatus] = useState<"checking" | "locked" | "unlocked">(
    prerequisiteSlug ? "checking" : "unlocked"
  );
  const [info, setInfo] = useState<LessonLockInfo | null>(null);

  useEffect(() => {
    if (!prerequisiteSlug) return;
    let cancelled = false;

    getLessonLockInfo(levelCode, prerequisiteSlug)
      .then((result) => {
        if (cancelled) return;
        setInfo(result);
        setStatus(result.locked ? "locked" : "unlocked");
      })
      .catch((error) => {
        console.error("getLessonLockInfo failed", error);
        if (cancelled) return;
        // Fail open on a transport/action error rather than stranding the
        // user on the skeleton forever -- the server-side re-check in
        // submitLessonQuizAttempt still enforces the real gate.
        setStatus("unlocked");
      });

    return () => {
      cancelled = true;
    };
  }, [levelCode, prerequisiteSlug]);

  if (status === "checking") {
    return <div className="h-40 w-full animate-pulse rounded-lg border border-dashed bg-muted/30" />;
  }

  if (status === "unlocked") {
    return <>{children}</>;
  }

  const levelProgress = info?.levelProgress ?? null;
  const percent =
    levelProgress && levelProgress.total > 0
      ? Math.round((levelProgress.completed / levelProgress.total) * 100)
      : 0;

  return (
    <div dir="rtl" className="flex flex-col items-center gap-4 rounded-lg border border-dashed p-12 text-center">
      <Lock className="h-8 w-8 text-muted-foreground" />

      <div className="space-y-1">
        <p className="font-medium">الدرس ده لسه مقفول</p>
        <p className="text-sm text-muted-foreground">
          {info?.prerequisiteTitleAr
            ? (
              <>
                لازم تنجح الأول في اختبار درس{" "}
                <span className="font-medium text-foreground">«{info.prerequisiteTitleAr}»</span>
              </>
            )
            : "لازم تنجح في اختبار الدرس السابق الأول عشان تفتح الدرس ده."}
        </p>
      </div>

      {levelProgress && levelProgress.total > 0 && (
        <div className="w-full max-w-xs space-y-1.5">
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${percent}%` }} />
          </div>
          <p className="text-xs text-muted-foreground">
            تقدمك في المستوى {levelCode.toUpperCase()}: {levelProgress.completed} / {levelProgress.total} ({percent}%)
          </p>
        </div>
      )}

      {prerequisiteSlug && (
        <Button asChild>
          <Link href={`/grammar/${levelCode.toLowerCase()}/${prerequisiteSlug}/quiz`}>
            روح لاختبار الدرس السابق
          </Link>
        </Button>
      )}
    </div>
  );
}
