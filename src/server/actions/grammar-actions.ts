"use server";

import { revalidatePath } from "next/cache";
import { Prisma, GrammarQuizType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/auth/session";
import { gradeQuiz } from "@/lib/grammar/grading";
import {
  GrammarExample,
  GrammarLessonContent,
  GrammarLevelFile,
  GrammarQuizQuestion,
  GrammarQuizQuestionPublic,
  GrammarStory,
  QuizAnswerValue,
  QuizGradeResult,
} from "@/types/grammar";
import grammarA1 from "@/data/grammar-a1.json";

// Add an entry here as each new grammar-<level>.json content file arrives.
const LEVEL_FALLBACKS: Record<string, GrammarLevelFile> = {
  A1: grammarA1 as GrammarLevelFile,
};

const CEFR_LEVEL_CODES = ["A1", "A2", "B1", "B2", "C1"] as const;

const LEVEL_NAMES: Record<string, string> = {
  A1: "A1 – Beginner",
  A2: "A2 – Elementary",
  B1: "B1 – Intermediate",
  B2: "B2 – Upper Intermediate",
  C1: "C1 – Advanced",
};

function normalizeLevelCode(level: string): string {
  return level.toUpperCase();
}

type ResolvedQuiz = {
  dbId: string | null;
  type: GrammarQuizType;
  passingScore: number;
  questions: GrammarQuizQuestion[];
};

async function findFallbackLesson(level: string, slug: string): Promise<GrammarLessonContent | null> {
  const fallback = LEVEL_FALLBACKS[level];
  return fallback?.lessons.find((l) => l.slug === slug) ?? null;
}

type QuizLookup =
  | { kind: "lesson"; levelCode: string; slug: string }
  | { kind: "exam"; levelCode: string; type: "WEEKLY" | "LEVEL"; weekNumber?: number }
  | { kind: "final" };

async function resolveQuizContent(lookup: QuizLookup): Promise<ResolvedQuiz | null> {
  try {
    if (lookup.kind === "lesson") {
      const level = normalizeLevelCode(lookup.levelCode);
      const lesson = await prisma.grammarLesson.findFirst({
        where: { slug: lookup.slug, cefrLevel: { code: level } },
        include: { quizzes: { where: { type: "LESSON" }, take: 1 } },
      });
      const quiz = lesson?.quizzes[0];
      if (quiz) {
        return {
          dbId: quiz.id,
          type: quiz.type,
          passingScore: quiz.passingScore,
          questions: quiz.questions as unknown as GrammarQuizQuestion[],
        };
      }
    } else if (lookup.kind === "exam") {
      const level = normalizeLevelCode(lookup.levelCode);
      const quiz = await prisma.grammarQuiz.findFirst({
        where: {
          type: lookup.type,
          cefrLevel: { code: level },
          ...(lookup.weekNumber !== undefined ? { weekNumber: lookup.weekNumber } : {}),
        },
      });
      if (quiz) {
        return {
          dbId: quiz.id,
          type: quiz.type,
          passingScore: quiz.passingScore,
          questions: quiz.questions as unknown as GrammarQuizQuestion[],
        };
      }
    } else {
      const quiz = await prisma.grammarQuiz.findFirst({ where: { type: "FINAL" } });
      if (quiz) {
        return {
          dbId: quiz.id,
          type: quiz.type,
          passingScore: quiz.passingScore,
          questions: quiz.questions as unknown as GrammarQuizQuestion[],
        };
      }
    }
  } catch {
    // fall through to JSON fallback (lesson quizzes only -- no WEEKLY/LEVEL/FINAL
    // content has been provided yet)
  }

  if (lookup.kind === "lesson") {
    const content = await findFallbackLesson(normalizeLevelCode(lookup.levelCode), lookup.slug);
    if (content) {
      return { dbId: null, ...content.quiz };
    }
  }

  return null;
}

function toPublicQuestion(question: GrammarQuizQuestion): GrammarQuizQuestionPublic {
  switch (question.type) {
    case "multiple-choice":
      return { type: question.type, question: question.question, options: question.options };
    case "reorder":
      return { type: question.type, question: question.question, words: question.words };
    default:
      return { type: question.type, question: question.question };
  }
}

export type GrammarQuizForPlay = {
  passingScore: number;
  questions: GrammarQuizQuestionPublic[];
} | null;

export async function getLessonQuizForPlay(levelCode: string, slug: string): Promise<GrammarQuizForPlay> {
  const resolved = await resolveQuizContent({ kind: "lesson", levelCode, slug });
  if (!resolved) return null;
  return { passingScore: resolved.passingScore, questions: resolved.questions.map(toPublicQuestion) };
}

// Exam access is gated on curriculum progress (see isWeekFullyPassed /
// isLevelFullyPassed / isFinalExamUnlocked below). Distinct from "not
// found" so pages can render a lock message vs. a 404. The lock check
// happens BEFORE resolving quiz content -- an early return, not just
// hiding a <QuizEngine> prop -- because an unrendered child element's
// props still end up in the RSC payload sent to the client (constructing
// <QuizEngine questions={...} /> serializes `questions` regardless of
// whether the parent ends up rendering it), so questions must never be
// fetched at all while locked.
export type GrammarExamForPlay =
  | { status: "not-found" }
  | { status: "locked" }
  | { status: "ready"; passingScore: number; questions: GrammarQuizQuestionPublic[] };

// Existence check only (no `questions` selected) so a nonexistent exam can
// be told apart from a locked one without paying the same RSC-payload-leak
// cost that resolving the full quiz would.
async function examQuizExists(
  lookup: Extract<QuizLookup, { kind: "exam" } | { kind: "final" }>
): Promise<boolean> {
  try {
    if (lookup.kind === "exam") {
      const level = normalizeLevelCode(lookup.levelCode);
      const count = await prisma.grammarQuiz.count({
        where: {
          type: lookup.type,
          cefrLevel: { code: level },
          ...(lookup.weekNumber !== undefined ? { weekNumber: lookup.weekNumber } : {}),
        },
      });
      return count > 0;
    }
    const count = await prisma.grammarQuiz.count({ where: { type: "FINAL" } });
    return count > 0;
  } catch {
    return false;
  }
}

export async function getExamQuizForPlay(
  levelCode: string,
  type: "WEEKLY" | "LEVEL",
  weekNumber?: number
): Promise<GrammarExamForPlay> {
  if (type === "WEEKLY" && (weekNumber === undefined || !Number.isInteger(weekNumber) || weekNumber <= 0)) {
    return { status: "not-found" };
  }

  const level = normalizeLevelCode(levelCode);

  if (!(await examQuizExists({ kind: "exam", levelCode: level, type, weekNumber }))) {
    return { status: "not-found" };
  }

  const unlocked =
    type === "WEEKLY"
      ? await isWeekFullyPassed(level, weekNumber!)
      : await isLevelFullyPassed(level);

  if (!unlocked) return { status: "locked" };

  const resolved = await resolveQuizContent({ kind: "exam", levelCode, type, weekNumber });
  if (!resolved) return { status: "not-found" };
  return {
    status: "ready",
    passingScore: resolved.passingScore,
    questions: resolved.questions.map(toPublicQuestion),
  };
}

export async function getFinalExamForPlay(): Promise<GrammarExamForPlay> {
  if (!(await examQuizExists({ kind: "final" }))) {
    return { status: "not-found" };
  }

  if (!(await isFinalExamUnlocked())) return { status: "locked" };

  const resolved = await resolveQuizContent({ kind: "final" });
  if (!resolved) return { status: "not-found" };
  return {
    status: "ready",
    passingScore: resolved.passingScore,
    questions: resolved.questions.map(toPublicQuestion),
  };
}

async function finalizeAttempt(
  resolved: ResolvedQuiz | null,
  answers: Record<number, QuizAnswerValue>,
  revalidateOnSave?: string
): Promise<QuizGradeResult & { saved: boolean; error?: string }> {
  if (!resolved) {
    return { score: 0, passed: false, results: [], saved: false, error: "Quiz not found." };
  }

  const grade = gradeQuiz(resolved.questions, answers, resolved.passingScore);

  let userId: string | null = null;
  try {
    userId = await requireUserId();
  } catch {
    // Not authenticated (or Supabase not configured yet) -- grade but don't persist.
  }

  if (!userId || !resolved.dbId) {
    // Known limitation, not a bug: without a real DB row (JSON-fallback
    // content, which is all that exists in this environment right now)
    // there is nothing to persist a QuizAttempt against, so a passed
    // fallback quiz can never satisfy getPassedLessonSlugs() and unlock
    // the next lesson. "saved: false" surfaces this to the caller instead
    // of silently discarding the result.
    return { ...grade, saved: false };
  }

  try {
    await prisma.quizAttempt.create({
      data: {
        userId,
        quizId: resolved.dbId,
        score: grade.score,
        passed: grade.passed,
        answers: answers as Prisma.InputJsonValue,
      },
    });
    if (revalidateOnSave) revalidatePath(revalidateOnSave);
    return { ...grade, saved: true };
  } catch {
    return { ...grade, saved: false, error: "Failed to save your progress." };
  }
}

// Grades server-side against the authoritative answer key (never trusts a
// client-supplied score), then persists a QuizAttempt with userId derived
// from requireUserId() -- same IDOR-safe pattern as updateSpeakingProgress.
export async function submitLessonQuizAttempt(
  levelCode: string,
  slug: string,
  answers: Record<number, QuizAnswerValue>
) {
  // Re-check the prerequisite gate server-side -- the UI hides the quiz
  // behind LessonGate, but that alone doesn't stop a direct call to this
  // action, so the lock must be enforced here too.
  const lesson = await getGrammarLesson(levelCode, slug);
  if (lesson?.locked) {
    return { score: 0, passed: false, results: [], saved: false, error: "الدرس ده لسه مقفول." };
  }

  const resolved = await resolveQuizContent({ kind: "lesson", levelCode, slug });
  return finalizeAttempt(resolved, answers, `/grammar/${levelCode.toLowerCase()}`);
}

export async function submitExamQuizAttempt(
  levelCode: string,
  type: "WEEKLY" | "LEVEL",
  answers: Record<number, QuizAnswerValue>,
  weekNumber?: number
) {
  if (type === "WEEKLY" && (weekNumber === undefined || !Number.isInteger(weekNumber) || weekNumber <= 0)) {
    return { score: 0, passed: false, results: [], saved: false, error: "Quiz not found." };
  }

  const level = normalizeLevelCode(levelCode);

  if (!(await examQuizExists({ kind: "exam", levelCode: level, type, weekNumber }))) {
    return { score: 0, passed: false, results: [], saved: false, error: "Quiz not found." };
  }

  const unlocked =
    type === "WEEKLY" ? await isWeekFullyPassed(level, weekNumber!) : await isLevelFullyPassed(level);

  if (!unlocked) {
    return { score: 0, passed: false, results: [], saved: false, error: "الامتحان ده لسه مقفول." };
  }

  const resolved = await resolveQuizContent({ kind: "exam", levelCode, type, weekNumber });
  return finalizeAttempt(resolved, answers, `/grammar/${levelCode.toLowerCase()}`);
}

export async function submitFinalExamAttempt(answers: Record<number, QuizAnswerValue>) {
  if (!(await examQuizExists({ kind: "final" }))) {
    return { score: 0, passed: false, results: [], saved: false, error: "Quiz not found." };
  }

  if (!(await isFinalExamUnlocked())) {
    return { score: 0, passed: false, results: [], saved: false, error: "الامتحان ده لسه مقفول." };
  }

  const resolved = await resolveQuizContent({ kind: "final" });
  return finalizeAttempt(resolved, answers, "/roadmap");
}

async function getPassedLessonSlugs(slugs: string[]): Promise<Set<string>> {
  if (slugs.length === 0) return new Set();

  let userId: string;
  try {
    userId = await requireUserId();
  } catch {
    return new Set();
  }

  try {
    const attempts = await prisma.quizAttempt.findMany({
      where: {
        userId,
        passed: true,
        quiz: { type: "LESSON", lesson: { slug: { in: slugs } } },
      },
      select: { quiz: { select: { lesson: { select: { slug: true } } } } },
    });
    return new Set(
      attempts
        .map((attempt) => attempt.quiz.lesson?.slug)
        .filter((slug): slug is string => Boolean(slug))
    );
  } catch {
    return new Set();
  }
}

async function isLevelFullyPassed(level: string): Promise<boolean> {
  const summaries = await getLevelLessonSummaries(level);
  if (summaries.length === 0) return false;
  const passed = await getPassedLessonSlugs(summaries.map((l) => l.slug));
  return passed.size === summaries.length;
}

async function isWeekFullyPassed(level: string, weekNumber: number): Promise<boolean> {
  const summaries = (await getLevelLessonSummaries(level)).filter((l) => l.weekNumber === weekNumber);
  if (summaries.length === 0) return false;
  const passed = await getPassedLessonSlugs(summaries.map((l) => l.slug));
  return passed.size === summaries.length;
}

async function isFinalExamUnlocked(): Promise<boolean> {
  const results = await Promise.all(CEFR_LEVEL_CODES.map((code) => isLevelFullyPassed(code)));
  return results.every(Boolean);
}

export type GrammarLessonSummary = {
  slug: string;
  titleAr: string;
  titleDe: string;
  weekNumber: number;
  orderInLevel: number;
  prerequisite: string | null;
  locked: boolean;
  passed: boolean;
};

type LessonSummaryRow = {
  slug: string;
  titleAr: string;
  titleDe: string;
  weekNumber: number;
  orderInLevel: number;
  prerequisite: string | null;
};

// Lightweight, `select`-only fetch for list/lock-check purposes -- no
// ruleDe/explanationAr/examples/story/quiz.questions. getGrammarLesson
// below fetches full content, but only for a single lesson via a direct
// findFirst, never for a whole level's worth of lessons at once.
async function getLevelLessonSummaries(level: string): Promise<LessonSummaryRow[]> {
  try {
    const dbLessons = await prisma.grammarLesson.findMany({
      where: { cefrLevel: { code: level } },
      select: {
        slug: true,
        titleAr: true,
        titleDe: true,
        weekNumber: true,
        orderInLevel: true,
        prerequisite: true,
      },
      orderBy: { orderInLevel: "asc" },
    });
    if (dbLessons.length > 0) return dbLessons;
  } catch {
    // fall through to JSON
  }

  const fallback = LEVEL_FALLBACKS[level];
  return fallback
    ? [...fallback.lessons]
        .sort((a, b) => a.orderInLevel - b.orderInLevel)
        .map((l) => ({
          slug: l.slug,
          titleAr: l.titleAr,
          titleDe: l.titleDe,
          weekNumber: l.weekNumber,
          orderInLevel: l.orderInLevel,
          prerequisite: l.prerequisite,
        }))
    : [];
}

export async function getGrammarLessonsByLevel(levelCode: string): Promise<GrammarLessonSummary[]> {
  const level = normalizeLevelCode(levelCode);
  const lessons = await getLevelLessonSummaries(level);
  const passedSlugs = await getPassedLessonSlugs(lessons.map((l) => l.slug));

  return lessons.map((lesson) => ({
    slug: lesson.slug,
    titleAr: lesson.titleAr,
    titleDe: lesson.titleDe,
    weekNumber: lesson.weekNumber,
    orderInLevel: lesson.orderInLevel,
    prerequisite: lesson.prerequisite,
    locked: lesson.prerequisite !== null && !passedSlugs.has(lesson.prerequisite),
    passed: passedSlugs.has(lesson.slug),
  }));
}

export type GrammarLessonView = GrammarLessonContent & {
  locked: boolean;
  prerequisiteTitleAr: string | null;
  levelProgress: { completed: number; total: number } | null;
};

export async function getGrammarLesson(levelCode: string, slug: string): Promise<GrammarLessonView | null> {
  const level = normalizeLevelCode(levelCode);
  let content: GrammarLessonContent | null = null;

  try {
    const dbLesson = await prisma.grammarLesson.findFirst({
      where: { slug, cefrLevel: { code: level } },
      include: { quizzes: { where: { type: "LESSON" }, take: 1 } },
    });
    if (dbLesson) {
      content = {
        slug: dbLesson.slug,
        weekNumber: dbLesson.weekNumber,
        orderInLevel: dbLesson.orderInLevel,
        titleDe: dbLesson.titleDe,
        titleAr: dbLesson.titleAr,
        prerequisite: dbLesson.prerequisite,
        ruleDe: dbLesson.ruleDe,
        explanationAr: dbLesson.explanationAr,
        examples: dbLesson.examples as unknown as GrammarExample[],
        story: dbLesson.story as unknown as GrammarStory,
        quiz: dbLesson.quizzes[0]
          ? {
              type: dbLesson.quizzes[0].type,
              passingScore: dbLesson.quizzes[0].passingScore,
              questions: dbLesson.quizzes[0].questions as unknown as GrammarQuizQuestion[],
            }
          : { type: "LESSON", passingScore: 70, questions: [] },
      };
    }
  } catch {
    // fall through to JSON
  }

  if (!content) {
    content = await findFallbackLesson(level, slug);
  }

  if (!content) return null;

  const locked = content.prerequisite
    ? !(await getPassedLessonSlugs([content.prerequisite])).has(content.prerequisite)
    : false;

  // Only worth the extra queries when actually locked -- the gate UI needs
  // the prerequisite's Arabic title and the level's completion count, but
  // the far more common unlocked path has no use for either.
  let prerequisiteTitleAr: string | null = null;
  let levelProgress: { completed: number; total: number } | null = null;
  if (locked) {
    const summaries = await getLevelLessonSummaries(level);
    prerequisiteTitleAr = summaries.find((l) => l.slug === content!.prerequisite)?.titleAr ?? null;
    const passed = await getPassedLessonSlugs(summaries.map((l) => l.slug));
    levelProgress = { completed: passed.size, total: summaries.length };
  }

  return { ...content, locked, prerequisiteTitleAr, levelProgress };
}

export type RoadmapLevelView = {
  code: string;
  name: string;
  totalLessons: number;
  completedLessons: number;
  state: "locked" | "available" | "completed";
};

export async function getRoadmap(): Promise<RoadmapLevelView[]> {
  // Batched instead of a per-level loop: one query for lesson counts
  // (groupBy), one for the user's distinct passed lessons, both grouped by
  // level in memory afterward -- a constant few queries regardless of how
  // many CEFR levels exist, instead of up to 2 full-content queries per
  // level (10 total, each dragging ruleDe/explanationAr/examples/story/
  // quiz.questions for every lesson along for no reason).
  const totalsByCode = new Map<string, number>();
  const passedByCode = new Map<string, number>();

  try {
    const levelRows = await prisma.cEFRLevel.findMany({ select: { id: true, code: true } });
    const idToCode = new Map(levelRows.map((l) => [l.id, l.code]));

    const totals = await prisma.grammarLesson.groupBy({
      by: ["cefrLevelId"],
      _count: { _all: true },
    });
    for (const row of totals) {
      const code = idToCode.get(row.cefrLevelId);
      if (code) totalsByCode.set(code, row._count._all);
    }

    let userId: string | null = null;
    try {
      userId = await requireUserId();
    } catch {
      // Not authenticated -- passedByCode stays empty (0 everywhere).
    }

    if (userId) {
      const passedLessons = await prisma.quizAttempt.findMany({
        where: { userId, passed: true, quiz: { type: "LESSON", lessonId: { not: null } } },
        distinct: ["quizId"], // a lesson can be attempted more than once; count it once
        select: { quiz: { select: { lesson: { select: { cefrLevelId: true } } } } },
      });
      for (const attempt of passedLessons) {
        const levelId = attempt.quiz.lesson?.cefrLevelId;
        const code = levelId ? idToCode.get(levelId) : undefined;
        if (code) passedByCode.set(code, (passedByCode.get(code) ?? 0) + 1);
      }
    }
  } catch {
    // DB unreachable -- every level falls through to the JSON-fallback
    // count below (only A1 has fallback content, matching
    // getLevelLessonSummaries's own fallback).
  }

  const levels: RoadmapLevelView[] = [];
  let previousCompleted = true; // A1 is always reachable

  for (const code of CEFR_LEVEL_CODES) {
    const total = totalsByCode.get(code) ?? LEVEL_FALLBACKS[code]?.lessons.length ?? 0;
    const completedCount = totalsByCode.has(code) ? passedByCode.get(code) ?? 0 : 0;
    const completed = total > 0 && completedCount === total;

    levels.push({
      code,
      name: LEVEL_NAMES[code] ?? code,
      totalLessons: total,
      completedLessons: completedCount,
      state: completed ? "completed" : previousCompleted ? "available" : "locked",
    });

    previousCompleted = completed;
  }

  return levels;
}
