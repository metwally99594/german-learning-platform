import { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getGrammarLesson,
  getLessonQuizForPlay,
  submitLessonQuizAttempt,
} from "@/server/actions/grammar-actions";
import { QuizEngine } from "@/components/grammar/quiz-engine";
import { LessonGate } from "@/components/grammar/lesson-gate";
import { QuizAnswerValue } from "@/types/grammar";

type PageProps = {
  params: Promise<{ level: string; slug: string }>;
};

export const metadata: Metadata = { title: "اختبار الدرس" };

export default async function LessonQuizPage({ params }: PageProps) {
  const { level, slug } = await params;
  const [lesson, quiz] = await Promise.all([
    getGrammarLesson(level, slug),
    getLessonQuizForPlay(level, slug),
  ]);

  if (!lesson || !quiz) {
    notFound();
  }

  async function submitAction(answers: Record<number, QuizAnswerValue>) {
    "use server";
    return submitLessonQuizAttempt(level, slug, answers);
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-8">
      <h1 dir="rtl" className="text-right text-2xl font-bold">
        اختبار الدرس
      </h1>
      <LessonGate locked={lesson.locked} prerequisiteSlug={lesson.prerequisite} levelCode={level}>
        <QuizEngine questions={quiz.questions} passingScore={quiz.passingScore} onSubmit={submitAction} />
      </LessonGate>
    </div>
  );
}
