export type GrammarExample = {
  de: string;
  ar: string;
};

export type GrammarStorySentence = {
  de: string;
  ar: string;
  highlight: boolean;
};

export type GrammarStory = {
  titleDe: string;
  titleAr: string;
  sentences: GrammarStorySentence[];
};

export type MultipleChoiceQuestion = {
  type: "multiple-choice";
  question: string;
  options: string[];
  answer: number;
  explanation: string;
};

export type TrueFalseQuestion = {
  type: "true-false";
  question: string;
  answer: boolean;
  explanation: string;
};

export type FillBlankQuestion = {
  type: "fill-blank";
  question: string;
  answer: string[];
  explanation: string;
};

export type ReorderQuestion = {
  type: "reorder";
  question: string;
  words: string[];
  answer: string;
  acceptAlso?: string[];
  explanation: string;
};

export type TranslateQuestion = {
  type: "translate";
  question: string;
  answer: string[];
  explanation: string;
};

export type GrammarQuizQuestion =
  | MultipleChoiceQuestion
  | TrueFalseQuestion
  | FillBlankQuestion
  | ReorderQuestion
  | TranslateQuestion;

// The shape sent to the client BEFORE a quiz is submitted -- answer/
// explanation/acceptAlso stripped so the answer key can't be read from the
// page before grading. See getGrammarQuizForPlay in grammar-actions.ts.
export type GrammarQuizQuestionPublic =
  | Pick<MultipleChoiceQuestion, "type" | "question" | "options">
  | Pick<TrueFalseQuestion, "type" | "question">
  | Pick<FillBlankQuestion, "type" | "question">
  | Pick<ReorderQuestion, "type" | "question" | "words">
  | Pick<TranslateQuestion, "type" | "question">;

export type GrammarQuizType = "LESSON" | "REVIEW" | "WEEKLY" | "LEVEL" | "FINAL";

export type GrammarQuizContent = {
  type: GrammarQuizType;
  passingScore: number;
  questions: GrammarQuizQuestion[];
};

export type GrammarLessonContent = {
  slug: string;
  weekNumber: number;
  orderInLevel: number;
  titleDe: string;
  titleAr: string;
  prerequisite: string | null;
  ruleDe: string;
  explanationAr: string;
  examples: GrammarExample[];
  story: GrammarStory;
  quiz: GrammarQuizContent;
};

export type GrammarLevelFile = {
  level: string;
  lessons: GrammarLessonContent[];
};

export type QuizAnswerValue = number | boolean | string;

export type QuizGradeResult = {
  score: number;
  passed: boolean;
  results: {
    correct: boolean;
    correctAnswer: string;
    explanation: string;
  }[];
};
