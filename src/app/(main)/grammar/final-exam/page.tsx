import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getFinalExamForPlay, submitFinalExamAttempt } from "@/server/actions/grammar-actions";
import { QuizEngine } from "@/components/grammar/quiz-engine";
import { QuizAnswerValue } from "@/types/grammar";

export const metadata: Metadata = { title: "الامتحان النهائي" };

export default async function FinalExamPage() {
  const quiz = await getFinalExamForPlay();

  if (!quiz) {
    notFound();
  }

  async function submitAction(answers: Record<number, QuizAnswerValue>) {
    "use server";
    return submitFinalExamAttempt(answers);
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-8">
      <h1 dir="rtl" className="text-right text-2xl font-bold">
        الامتحان النهائي
      </h1>
      <QuizEngine questions={quiz.questions} passingScore={quiz.passingScore} onSubmit={submitAction} />
    </div>
  );
}
