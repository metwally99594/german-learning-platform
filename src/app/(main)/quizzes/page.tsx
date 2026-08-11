import { Metadata } from "next";
import Link from "next/link";
import { ClipboardList, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { getQuizzes } from "@/server/actions/quiz-actions";

export const metadata: Metadata = {
  title: "Quizzes",
  description: "Test your knowledge with short quizzes.",
};

export default async function QuizzesPage() {
  const quizzes = await getQuizzes();

  return (
    <div className="space-y-6 px-4 py-8">
      <div>
        <h1 className="text-3xl font-bold">Quizzes</h1>
        <p className="text-muted-foreground">Check your understanding with a quick quiz.</p>
      </div>

      {quizzes.length === 0 ? (
        <p className="text-muted-foreground">No quizzes are available yet. Check back soon.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {quizzes.map((quiz) => (
            <Link key={quiz.id} href={`/quizzes/${quiz.id}`}>
              <Card className="h-full border-border/50 bg-card/70 backdrop-blur-md transition-colors hover:bg-accent/50">
                <CardHeader>
                  <CardTitle>{quiz.title}</CardTitle>
                  {quiz.description && <CardDescription>{quiz.description}</CardDescription>}
                </CardHeader>
                <CardContent className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <ClipboardList className="h-3.5 w-3.5" />
                    {quiz.questionCount} questions
                  </span>
                  {quiz.timeLimit && (
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {Math.round(quiz.timeLimit / 60)} min
                    </span>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
