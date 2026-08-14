import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getLessonContent, getAllGrammarLessonParams } from "@/server/actions/grammar-actions";
import { GrammarRule } from "@/components/grammar/grammar-rule";
import { ArabicExplanation } from "@/components/grammar/arabic-explanation";
import { ExampleList } from "@/components/grammar/example-list";
import { StoryBlock } from "@/components/grammar/story-block";
import { LessonGateClient } from "@/components/grammar/lesson-gate-client";
import { Button } from "@/components/ui/button";
import { SpeakableText } from "@/components/speech/speakable-text";

type PageProps = {
  params: Promise<{ level: string; slug: string }>;
};

// Pre-render every known lesson at build time; new lessons added by a later
// seed (e.g. A2) fall back to on-demand ISR instead of a 404, since
// dynamicParams defaults to true.
export async function generateStaticParams() {
  return getAllGrammarLessonParams();
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { level, slug } = await params;
  const lesson = await getLessonContent(level, slug);
  return { title: lesson ? `${lesson.titleAr} — ${lesson.titleDe}` : "الدرس غير موجود" };
}

export default async function GrammarLessonPage({ params }: PageProps) {
  const { level, slug } = await params;
  const lesson = await getLessonContent(level, slug);

  if (!lesson) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-8">
      <div dir="rtl" className="text-right">
        <p className="text-sm text-muted-foreground">الأسبوع {lesson.weekNumber}</p>
        <h1 className="text-3xl font-bold">{lesson.titleAr}</h1>
        <p dir="ltr" className="text-left text-lg text-muted-foreground">
          <SpeakableText text={lesson.titleDe} className="text-lg text-muted-foreground" />
        </p>
      </div>

      <LessonGateClient levelCode={level} prerequisiteSlug={lesson.prerequisite}>
        <div className="space-y-6">
          <GrammarRule ruleDe={lesson.ruleDe} />
          <ArabicExplanation text={lesson.explanationAr} />
          <ExampleList examples={lesson.examples} />
          <StoryBlock story={lesson.story} />

          <p className="text-center text-xs text-muted-foreground">
            اضغط على أي نص ألماني لسماع النطق — ويمكنك تحديد كلمة قبل الضغط لسماع الكلمة فقط.
          </p>

          <Button asChild>
            <Link href={`/grammar/${level}/${slug}/quiz`}>ابدأ اختبار الدرس</Link>
          </Button>
        </div>
      </LessonGateClient>
    </div>
  );
}
