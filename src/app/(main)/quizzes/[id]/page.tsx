import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getQuizById } from "@/server/actions/quiz-actions";
import { QuizRunner } from "@/components/quizzes/quiz-runner";

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const quiz = await getQuizById(id);
  return {
    title: quiz ? quiz.title : "Quiz not found",
  };
}

export default async function QuizDetailPage({ params }: PageProps) {
  const { id } = await params;
  const quiz = await getQuizById(id);

  if (!quiz) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-8">
      <div>
        <h1 className="text-3xl font-bold">{quiz.title}</h1>
        {quiz.description && <p className="text-muted-foreground">{quiz.description}</p>}
      </div>

      {quiz.questions.length === 0 ? (
        <p className="text-muted-foreground">This quiz doesn&apos;t have any questions yet.</p>
      ) : (
        <QuizRunner questions={quiz.questions} passingScore={quiz.passingScore} />
      )}
    </div>
  );
}
