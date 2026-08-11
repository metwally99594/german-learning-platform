import { Metadata } from "next";
import { notFound } from "next/navigation";
import { Lock } from "lucide-react";
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

  if (!Number.isInteger(weekNumber) || weekNumber <= 0) {
    notFound();
  }

  const exam = await getExamQuizForPlay(level, "WEEKLY", weekNumber);

  if (exam.status === "not-found") {
    notFound();
  }

  async function submitAction(answers: Record<number, QuizAnswerValue>) {
    "use server";
    return submitExamQuizAttempt(level, "WEEKLY", answers, weekNumber);
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-8">
      <h1 dir="rtl" className="text-right text-2xl font-bold">
        اختبار الأسبوع {weekNumber}
      </h1>

      {exam.status === "locked" ? (
        <div dir="rtl" className="flex flex-col items-center gap-3 rounded-lg border border-dashed p-12 text-center">
          <Lock className="h-8 w-8 text-muted-foreground" />
          <p className="font-medium">الامتحان ده لسه مقفول</p>
          <p className="text-sm text-muted-foreground">لازم تنجح في كل دروس الأسبوع ده الأول.</p>
        </div>
      ) : (
        <QuizEngine questions={exam.questions} passingScore={exam.passingScore} onSubmit={submitAction} />
      )}
    </div>
  );
}
