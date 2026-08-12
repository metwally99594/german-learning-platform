import { Metadata } from "next";
import Link from "next/link";
import { Lock, BookOpen, CheckCircle2 } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { getGrammarLessonsByLevel } from "@/server/actions/grammar-actions";
import { cn } from "@/lib/utils";

type PageProps = {
  params: Promise<{ level: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { level } = await params;
  return { title: `Grammar ${level.toUpperCase()}` };
}

export default async function GrammarLevelPage({ params }: PageProps) {
  const { level } = await params;
  const lessons = await getGrammarLessonsByLevel(level);
  const completedCount = lessons.filter((l) => l.passed).length;
  const progressPercent = lessons.length > 0 ? Math.round((completedCount / lessons.length) * 100) : 0;

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-8">
      <div dir="rtl" className="text-right">
        <h1 className="text-3xl font-bold">قواعد {level.toUpperCase()}</h1>
        <p className="text-muted-foreground">دروس القواعد لمستوى {level.toUpperCase()}.</p>
      </div>

      {lessons.length > 0 && (
        <div dir="rtl" className="space-y-1.5">
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="text-right text-sm text-muted-foreground">
            {completedCount} / {lessons.length} دروس مكتملة ({progressPercent}%)
          </p>
        </div>
      )}

      {lessons.length === 0 ? (
        <p dir="rtl" className="text-right text-muted-foreground">
          لسه مفيش دروس لمستوى {level.toUpperCase()}. تابعنا قريب.
        </p>
      ) : (
        <div className="space-y-3">
          {lessons.map((lesson) => {
            const card = (
              <Card
                className={cn(
                  "border-border/50 bg-card/70 backdrop-blur-md transition-colors",
                  !lesson.locked && "hover:bg-accent/50",
                  lesson.locked && "opacity-50"
                )}
              >
                <CardHeader className="flex flex-row items-center gap-3 space-y-0">
                  {lesson.locked ? (
                    <Lock className="h-5 w-5 shrink-0 text-muted-foreground" />
                  ) : lesson.passed ? (
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-green-600 dark:text-green-500" />
                  ) : (
                    <BookOpen className="h-5 w-5 shrink-0 text-muted-foreground/60" />
                  )}
                  <div dir="rtl" className="flex-1 text-right">
                    <CardTitle className="text-base">{lesson.titleAr}</CardTitle>
                    <p dir="ltr" className="text-left text-sm text-muted-foreground">
                      {lesson.titleDe}
                    </p>
                  </div>
                </CardHeader>
              </Card>
            );

            return lesson.locked ? (
              <div key={lesson.slug}>{card}</div>
            ) : (
              <Link key={lesson.slug} href={`/grammar/${level}/${lesson.slug}`}>
                {card}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
