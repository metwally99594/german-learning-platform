import { Metadata } from "next";
import { notFound } from "next/navigation";
import { Lock } from "lucide-react";
import { getFinalExamForPlay, submitFinalExamAttempt } from "@/server/actions/grammar-actions";
import { QuizEngine } from "@/components/grammar/quiz-engine";
import { QuizAnswerValue } from "@/types/grammar";

export const metadata: Metadata = { title: "الامتحان النهائي" };

export default async function FinalExamPage() {
  const exam = await getFinalExamForPlay();

  if (exam.status === "not-found") {
    notFound();
  }

  async function submitAction(answers: Record<number, QuizAnswerValue>) {
    "use server";
    return submitFinalExamAttempt(answers);
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-8">
      <h1 dir="rtl" className="text-right text-2xl font-bold">
        الامتحان النهائي
      </h1>

      {exam.status === "locked" ? (
        <div dir="rtl" className="flex flex-col items-center gap-3 rounded-lg border border-dashed p-12 text-center">
          <Lock className="h-8 w-8 text-muted-foreground" />
          <p className="font-medium">الامتحان ده لسه مقفول</p>
          <p className="text-sm text-muted-foreground">لازم تنجح في كل المستويات من A1 لـ C1 الأول.</p>
        </div>
      ) : (
        <QuizEngine questions={exam.questions} passingScore={exam.passingScore} onSubmit={submitAction} />
      )}
    </div>
  );
}
