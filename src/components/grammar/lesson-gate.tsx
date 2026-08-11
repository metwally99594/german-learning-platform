import Link from "next/link";
import { Lock } from "lucide-react";

export type LessonGateProps = {
  locked: boolean;
  prerequisiteSlug: string | null;
  levelCode: string;
  children: React.ReactNode;
};

export function LessonGate({ locked, prerequisiteSlug, levelCode, children }: LessonGateProps) {
  if (!locked) {
    return <>{children}</>;
  }

  return (
    <div dir="rtl" className="flex flex-col items-center gap-3 rounded-lg border border-dashed p-12 text-center">
      <Lock className="h-8 w-8 text-muted-foreground" />
      <p className="font-medium">الدرس ده لسه مقفول</p>
      <p className="text-sm text-muted-foreground">لازم تنجح في اختبار الدرس السابق الأول عشان تفتح الدرس ده.</p>
      {prerequisiteSlug && (
        <Link
          href={`/grammar/${levelCode.toLowerCase()}/${prerequisiteSlug}`}
          className="text-sm text-primary underline underline-offset-4"
        >
          روح للدرس السابق
        </Link>
      )}
    </div>
  );
}
