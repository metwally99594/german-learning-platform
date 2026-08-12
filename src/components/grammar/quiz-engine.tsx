"use client";

import { useState } from "react";
import { GrammarQuizQuestionPublic, QuizAnswerValue, QuizGradeResult } from "@/types/grammar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { ReorderQuestionInput } from "./reorder-question-input";

type SubmitResult = QuizGradeResult & { saved: boolean; error?: string };

// Multiple-choice options are sometimes German words, sometimes Arabic
// phonetic transliterations (e.g. a "how is this pronounced?" question) --
// there's no fixed script for this field, so force-rendering the options
// list as dir="ltr" always misaligns the Arabic case. Decide per question
// from whichever script actually appears.
const hasArabicText = (s: string) => /[؀-ۿ]/.test(s);

export type QuizEngineProps = {
  questions: GrammarQuizQuestionPublic[];
  passingScore: number;
  onSubmit: (answers: Record<number, QuizAnswerValue>) => Promise<SubmitResult>;
};

function QuizQuestionCard({
  index,
  question,
  value,
  onChange,
}: {
  index: number;
  question: GrammarQuizQuestionPublic;
  value: QuizAnswerValue | undefined;
  onChange: (value: QuizAnswerValue) => void;
}) {
  return (
    <div className="space-y-3 rounded-lg border p-4">
      <p dir="rtl" className="text-right font-medium">
        <span dir="ltr" className="inline-block">
          {index + 1}.
        </span>{" "}
        {question.question}
      </p>

      {question.type === "multiple-choice" && (() => {
        const rtl = question.options.some(hasArabicText);
        return (
          <div dir={rtl ? "rtl" : "ltr"} className={cn("space-y-2", rtl ? "text-right" : "text-left")}>
            {question.options.map((option, i) => (
              <label
                key={i}
                className={cn(
                  "flex cursor-pointer items-center gap-2 rounded-md border p-2 text-sm",
                  value === i && "border-primary bg-accent"
                )}
              >
                <input
                  type="radio"
                  name={`q-${index}`}
                  checked={value === i}
                  onChange={() => onChange(i)}
                />
                {option}
              </label>
            ))}
          </div>
        );
      })()}

      {question.type === "true-false" && (
        <div className="flex gap-2">
          <Button
            type="button"
            variant={value === true ? "default" : "outline"}
            onClick={() => onChange(true)}
          >
            صح
          </Button>
          <Button
            type="button"
            variant={value === false ? "default" : "outline"}
            onClick={() => onChange(false)}
          >
            غلط
          </Button>
        </div>
      )}

      {(question.type === "fill-blank" || question.type === "translate") && (
        <Input
          dir="ltr"
          value={typeof value === "string" ? value : ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder="اكتب إجابتك"
        />
      )}

      {question.type === "reorder" && (
        <ReorderQuestionInput
          words={question.words}
          value={typeof value === "string" ? value : ""}
          onChange={onChange}
        />
      )}
    </div>
  );
}

export function QuizEngine({ questions, passingScore, onSubmit }: QuizEngineProps) {
  const [answers, setAnswers] = useState<Record<number, QuizAnswerValue>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<SubmitResult | null>(null);

  const allAnswered = questions.every((_, i) => {
    const value = answers[i];
    return value !== undefined && value !== "";
  });

  const handleSubmit = async () => {
    setSubmitting(true);
    const res = await onSubmit(answers);
    setResult(res);
    setSubmitting(false);
  };

  const handleRetry = () => {
    setAnswers({});
    setResult(null);
  };

  if (result) {
    return (
      <div className="space-y-6">
        <div
          className={cn(
            "rounded-lg border p-6 text-center",
            result.passed
              ? "border-green-300 bg-green-50 dark:border-green-800 dark:bg-green-950/30"
              : "border-red-300 bg-red-50 dark:border-red-900 dark:bg-red-950/30"
          )}
        >
          <p className="text-lg font-medium">{result.passed ? "ناجح! 🎉" : "لسه محتاج مذاكرة"}</p>
          <p className="text-3xl font-bold">{result.score}%</p>
          <p className="text-sm text-muted-foreground">الحد الأدنى للنجاح: {passingScore}%</p>
          {!result.saved && !result.error && (
            <p className="mt-2 text-xs text-muted-foreground">
              (النتيجة دي معروضة بس مش محفوظة — سجّل الدخول عشان تحفظ تقدمك)
            </p>
          )}
          {result.error && <p className="mt-2 text-xs text-destructive">{result.error}</p>}
        </div>

        <div className="space-y-3">
          {questions.map((question, i) => {
            const questionResult = result.results[i];
            if (!questionResult) return null;
            return (
              <div
                key={i}
                className={cn(
                  "space-y-1 rounded-md border p-3",
                  questionResult.correct
                    ? "border-green-200 dark:border-green-900"
                    : "border-red-200 dark:border-red-900"
                )}
              >
                <p dir="rtl" className="text-right font-medium">
                  <span dir="ltr" className="inline-block">
                    {i + 1}.
                  </span>{" "}
                  {question.question}
                </p>
                <p dir="rtl" className="text-right text-sm">
                  {questionResult.correct ? "✅ صح" : `❌ غلط — الإجابة الصحيحة: ${questionResult.correctAnswer}`}
                </p>
                <p dir="rtl" className="text-right text-sm text-muted-foreground">
                  {questionResult.explanation}
                </p>
              </div>
            );
          })}
        </div>

        <Button variant="outline" onClick={handleRetry}>
          حاول تاني
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {questions.map((question, index) => (
        <QuizQuestionCard
          key={index}
          index={index}
          question={question}
          value={answers[index]}
          onChange={(value) => setAnswers((prev) => ({ ...prev, [index]: value }))}
        />
      ))}
      <Button onClick={handleSubmit} disabled={!allAnswered || submitting}>
        {submitting ? "جاري التصحيح..." : "تسليم"}
      </Button>
    </div>
  );
}
