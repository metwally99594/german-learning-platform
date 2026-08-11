import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getExamQuizForPlay, submitExamQuizAttempt } from "@/server/actions/grammar-actions";
import { QuizEngine } from "@/components/grammar/quiz-engine";
import { QuizAnswerValue } from "@/types/grammar";

type PageProps = {
  params: Promise<{ level: string }>;
};

export const metadata: Metadata = { title: "اختبار المستوى" };

export default async function LevelExamPage({ params }: PageProps) {
  const { level } = await params;
  const quiz = await getExamQuizForPlay(level, "LEVEL");

  if (!quiz) {
    notFound();
  }

  async function submitAction(answers: Record<number, QuizAnswerValue>) {
    "use server";
    return submitExamQuizAttempt(level, "LEVEL", answers);
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-8">
      <h1 dir="rtl" className="text-right text-2xl font-bold">
        اختبار مستوى {level.toUpperCase()}
      </h1>
      <QuizEngine questions={quiz.questions} passingScore={quiz.passingScore} onSubmit={submitAction} />
    </div>
  );
}
