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
  const lesson = await getGrammarLesson(level, slug);

  if (!lesson) {
    notFound();
  }

  // Don't even resolve the quiz questions when locked -- the RSC payload
  // for this page is sent to the client regardless of what LessonGate
  // renders, so fetching them here would leak question text (not answers,
  // those are already stripped, but still more than a locked page should
  // disclose) before the prerequisite is passed.
  if (lesson.locked) {
    return (
      <div className="mx-auto max-w-2xl space-y-6 px-4 py-8">
        <h1 dir="rtl" className="text-right text-2xl font-bold">
          اختبار الدرس
        </h1>
        <LessonGate locked prerequisiteSlug={lesson.prerequisite} levelCode={level}>
          <></>
        </LessonGate>
      </div>
    );
  }

  const quiz = await getLessonQuizForPlay(level, slug);
  if (!quiz) {
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
      <QuizEngine questions={quiz.questions} passingScore={quiz.passingScore} onSubmit={submitAction} />
    </div>
  );
}
