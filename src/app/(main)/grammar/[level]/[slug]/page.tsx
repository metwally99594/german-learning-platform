import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getGrammarLesson } from "@/server/actions/grammar-actions";
import { GrammarRule } from "@/components/grammar/grammar-rule";
import { ArabicExplanation } from "@/components/grammar/arabic-explanation";
import { ExampleList } from "@/components/grammar/example-list";
import { StoryBlock } from "@/components/grammar/story-block";
import { LessonGate } from "@/components/grammar/lesson-gate";
import { Button } from "@/components/ui/button";

type PageProps = {
  params: Promise<{ level: string; slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { level, slug } = await params;
  const lesson = await getGrammarLesson(level, slug);
  return { title: lesson ? `${lesson.titleAr} — ${lesson.titleDe}` : "الدرس غير موجود" };
}

export default async function GrammarLessonPage({ params }: PageProps) {
  const { level, slug } = await params;
  const lesson = await getGrammarLesson(level, slug);

  if (!lesson) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-8">
      <div dir="rtl" className="text-right">
        <p className="text-sm text-muted-foreground">الأسبوع {lesson.weekNumber}</p>
        <h1 className="text-3xl font-bold">{lesson.titleAr}</h1>
        <p dir="ltr" className="text-left text-lg text-muted-foreground">
          {lesson.titleDe}
        </p>
      </div>

      <LessonGate locked={lesson.locked} prerequisiteSlug={lesson.prerequisite} levelCode={level}>
        <div className="space-y-6">
          <GrammarRule ruleDe={lesson.ruleDe} />
          <ArabicExplanation text={lesson.explanationAr} />
          <ExampleList examples={lesson.examples} />
          <StoryBlock story={lesson.story} />

          <Button asChild>
            <Link href={`/grammar/${level}/${slug}/quiz`}>ابدأ اختبار الدرس</Link>
          </Button>
        </div>
      </LessonGate>
    </div>
  );
}
