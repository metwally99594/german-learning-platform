import { Metadata } from "next";
import Link from "next/link";
import { Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { getLessons } from "@/server/actions/lesson-actions";

export const metadata: Metadata = {
  title: "Lessons",
  description: "Structured CEFR lessons from A1 to C1.",
};

export default async function LessonsPage() {
  const lessons = await getLessons();

  if (lessons.length === 0) {
    return (
      <div className="space-y-4 px-4 py-8">
        <h1 className="text-3xl font-bold">Lessons</h1>
        <p className="text-muted-foreground">
          No lessons are available yet. Check back soon — new CEFR lessons are added regularly.
        </p>
      </div>
    );
  }

  const byLevel = new Map<string, typeof lessons>();
  for (const lesson of lessons) {
    const key = lesson.cefrLevel.code;
    byLevel.set(key, [...(byLevel.get(key) ?? []), lesson]);
  }

  return (
    <div className="space-y-8 px-4 py-8">
      <div>
        <h1 className="text-3xl font-bold">Lessons</h1>
        <p className="text-muted-foreground">Work through structured lessons at your level.</p>
      </div>

      {Array.from(byLevel.entries()).map(([code, levelLessons]) => (
        <section key={code} className="space-y-3">
          <h2 className="text-xl font-semibold">{levelLessons[0].cefrLevel.name}</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {levelLessons.map((lesson) => (
              <Link key={lesson.id} href={`/lessons/${lesson.id}`}>
                <Card className="h-full border-border/50 bg-card/70 backdrop-blur-md transition-colors hover:bg-accent/50">
                  <CardHeader>
                    <CardTitle>{lesson.title}</CardTitle>
                    {lesson.description && <CardDescription>{lesson.description}</CardDescription>}
                  </CardHeader>
                  <CardContent>
                    <span className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="h-3.5 w-3.5" />
                      {lesson.estimatedMinutes} min
                    </span>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
