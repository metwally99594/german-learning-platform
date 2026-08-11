import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getExamQuizForPlay, submitExamQuizAttempt } from "@/server/actions/grammar-actions";
import { QuizEngine } from "@/components/grammar/quiz-engine";
import { QuizAnswerValue } from "@/types/grammar";

type PageProps = {
  params: Promise<{ level: string; n: string }>;
};

export const metadata: Metadata = { title: "اختبار الأسبوع" };

export default async function WeekExamPage({ params }: PageProps) {
  const { level, n } = await params;
  const weekNumber = Number(n);
  const quiz = Number.isFinite(weekNumber)
    ? await getExamQuizForPlay(level, "WEEKLY", weekNumber)
    : null;

  if (!quiz) {
    notFound();
  }

  async function submitAction(answers: Record<number, QuizAnswerValue>) {
    "use server";
    return submitExamQuizAttempt(level, "WEEKLY", answers, weekNumber);
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-8">
      <h1 dir="rtl" className="text-right text-2xl font-bold">
        اختبار الأسبوع {n}
      </h1>
      <QuizEngine questions={quiz.questions} passingScore={quiz.passingScore} onSubmit={submitAction} />
    </div>
  );
}
