import { GrammarQuizQuestion, QuizAnswerValue, QuizGradeResult } from "@/types/grammar";

function normalize(text: string): string {
  return text
    .trim()
    .replace(/\s+/g, " ")
    .replace(/[.!?]+$/g, "")
    .toLowerCase();
}

export function gradeQuestion(
  question: GrammarQuizQuestion,
  userAnswer: QuizAnswerValue | undefined
): boolean {
  if (userAnswer === undefined || userAnswer === null) return false;

  switch (question.type) {
    case "multiple-choice":
      return typeof userAnswer === "number" && userAnswer === question.answer;
    case "true-false":
      return typeof userAnswer === "boolean" && userAnswer === question.answer;
    case "fill-blank":
    case "translate": {
      if (typeof userAnswer !== "string") return false;
      const normalized = normalize(userAnswer);
      return question.answer.some((accepted) => normalize(accepted) === normalized);
    }
    case "reorder": {
      if (typeof userAnswer !== "string") return false;
      const normalized = normalize(userAnswer);
      const accepted = [question.answer, ...(question.acceptAlso ?? [])];
      return accepted.some((a) => normalize(a) === normalized);
    }
    default:
      return false;
  }
}

export function getCorrectAnswerLabel(question: GrammarQuizQuestion): string {
  switch (question.type) {
    case "multiple-choice":
      return question.options[question.answer];
    case "true-false":
      return question.answer ? "صح" : "غلط";
    case "fill-blank":
    case "translate":
      return question.answer[0];
    case "reorder":
      return question.answer;
    default:
      return "";
  }
}

export function gradeQuiz(
  questions: GrammarQuizQuestion[],
  answers: Record<number, QuizAnswerValue>,
  passingScore: number
): QuizGradeResult {
  const results = questions.map((question, index) => ({
    correct: gradeQuestion(question, answers[index]),
    correctAnswer: getCorrectAnswerLabel(question),
    explanation: question.explanation,
  }));

  const correctCount = results.filter((r) => r.correct).length;
  const score = questions.length > 0 ? Math.round((correctCount / questions.length) * 100) : 0;

  return {
    score,
    passed: score >= passingScore,
    results,
  };
}
