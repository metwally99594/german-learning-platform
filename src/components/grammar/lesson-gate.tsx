import Link from "next/link";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

export type LessonGateProps = {
  locked: boolean;
  prerequisiteSlug: string | null;
  prerequisiteTitleAr: string | null;
  levelCode: string;
  levelProgress: { completed: number; total: number } | null;
  children: React.ReactNode;
};

export function LessonGate({
  locked,
  prerequisiteSlug,
  prerequisiteTitleAr,
  levelCode,
  levelProgress,
  children,
}: LessonGateProps) {
  if (!locked) {
    return <>{children}</>;
  }

  const percent = levelProgress && levelProgress.total > 0
    ? Math.round((levelProgress.completed / levelProgress.total) * 100)
    : 0;

  return (
    <div dir="rtl" className="flex flex-col items-center gap-4 rounded-lg border border-dashed p-12 text-center">
      <Lock className="h-8 w-8 text-muted-foreground" />

      <div className="space-y-1">
        <p className="font-medium">الدرس ده لسه مقفول</p>
        <p className="text-sm text-muted-foreground">
          {prerequisiteTitleAr
            ? (
              <>
                لازم تنجح الأول في اختبار درس{" "}
                <span className="font-medium text-foreground">«{prerequisiteTitleAr}»</span>
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
