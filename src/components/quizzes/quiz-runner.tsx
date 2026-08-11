"use client";

import { useState } from "react";
import { QuizQuestion } from "@prisma/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export type QuizRunnerProps = {
  questions: QuizQuestion[];
  passingScore: number;
};

function normalize(value: string) {
  return value.trim().toLowerCase();
}

export function QuizRunner({ questions, passingScore }: QuizRunnerProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const scorable = questions.filter(
    (q) => q.type === "MULTIPLE_CHOICE" || q.type === "TRUE_FALSE" || q.type === "FILL_IN_BLANK"
  );
  const totalPoints = scorable.reduce((sum, q) => sum + q.points, 0);
  const earnedPoints = submitted
    ? scorable.reduce(
        (sum, q) => (normalize(answers[q.id] ?? "") === normalize(q.correctAnswer) ? sum + q.points : sum),
        0
      )
    : 0;
  const percentage = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
  const passed = percentage >= passingScore;

  if (submitted) {
    return (
      <Card className="border-border/50 bg-card/70 backdrop-blur-md">
        <CardContent className="space-y-4 py-8 text-center">
          <p className="text-lg font-medium">{passed ? "Bestanden!" : "Nicht bestanden"}</p>
          <p className="text-3xl font-bold">{percentage}%</p>
          <p className="text-sm text-muted-foreground">
            {earnedPoints} / {totalPoints} points · passing score {passingScore}%
          </p>
          <Button
            variant="outline"
            onClick={() => {
              setAnswers({});
              setSubmitted(false);
            }}
          >
            Try again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {questions.map((question, index) => {
        const options = Array.isArray(question.options) ? (question.options as string[]) : [];

        return (
          <Card key={question.id} className="border-border/50 bg-card/70 backdrop-blur-md">
            <CardHeader>
              <CardTitle className="text-base">
                {index + 1}. {question.prompt}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {question.type === "MULTIPLE_CHOICE" && (
                <div className="space-y-2">
                  {options.map((option) => (
                    <label
                      key={option}
                      className={cn(
                        "flex cursor-pointer items-center gap-2 rounded-md border p-2 text-sm",
                        answers[question.id] === option && "border-primary bg-accent"
                      )}
                    >
                      <input
                        type="radio"
                        name={question.id}
                        value={option}
                        checked={answers[question.id] === option}
                        onChange={() => setAnswers((prev) => ({ ...prev, [question.id]: option }))}
                      />
                      {option}
                    </label>
                  ))}
                </div>
              )}

              {question.type === "TRUE_FALSE" && (
                <div className="flex gap-2">
                  {(options.length > 0 ? options : ["Wahr", "Falsch"]).map((option) => (
                    <Button
                      key={option}
                      type="button"
                      variant={answers[question.id] === option ? "default" : "outline"}
                      onClick={() => setAnswers((prev) => ({ ...prev, [question.id]: option }))}
                    >
                      {option}
                    </Button>
                  ))}
                </div>
              )}

              {question.type === "FILL_IN_BLANK" && (
                <Input
                  value={answers[question.id] ?? ""}
                  onChange={(e) => setAnswers((prev) => ({ ...prev, [question.id]: e.target.value }))}
                  placeholder="Your answer"
                />
              )}

              {(question.type === "MATCHING" || question.type === "ORDERING") && (
                <p className="text-sm text-muted-foreground">
                  This question type isn&apos;t available in quick-quiz mode yet.
                </p>
              )}
            </CardContent>
          </Card>
        );
      })}

      <Button onClick={() => setSubmitted(true)}>Submit quiz</Button>
    </div>
  );
}
