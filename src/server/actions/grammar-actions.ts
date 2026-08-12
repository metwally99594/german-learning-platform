"use server";

import { revalidatePath, unstable_cache } from "next/cache";
import { cache } from "react";
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

// Grammar lesson/quiz text only changes when someone re-seeds the DB (a few
// times a year), not per-request -- so it's cached indefinitely (tags,
// revalidate: false) and only invalidated explicitly via revalidateTag from
// POST /api/revalidate-grammar (see scripts/seed-grammar.ts for the caller).
// Anything that depends on requireUserId()/cookies (locked state, passed
// lessons, progress counts) must NEVER be wrapped in unstable_cache -- that
// cache is shared across all users and requests, so caching a per-user
// result would leak one user's progress to everyone else.
const GRAMMAR_CONTENT_TAG = "grammar-content";

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

// TEMP-DIAGNOSTIC: timing instrumentation to confirm/deny where /grammar/[level]
// spends its ~278ms server time -- remove once the real numbers are in from
// Vercel logs. Two separate timers because requireUserId() (JWT validation)
// and the actual quizAttempt query are different costs; conflating them would
// hide which one (if either) actually matters.
async function getPassedLessonSlugs(slugs: string[]): Promise<Set<string>> {
  if (slugs.length === 0) return new Set();

  const authStart = performance.now();
  let userId: string;
  try {
    userId = await requireUserId();
  } catch {
    console.log(`[TIMING] requireUserId() (failed): ${(performance.now() - authStart).toFixed(1)}ms`);
    return new Set();
  }
  console.log(`[TIMING] requireUserId(): ${(performance.now() - authStart).toFixed(1)}ms`);

  const queryStart = performance.now();
  try {
    const attempts = await prisma.quizAttempt.findMany({
      where: {
        userId,
        passed: true,
        quiz: { type: "LESSON", lesson: { slug: { in: slugs } } },
      },
      select: { quiz: { select: { lesson: { select: { slug: true } } } } },
    });
    console.log(
      `[TIMING] quizAttempt.findMany (${slugs.length} slugs): ${(performance.now() - queryStart).toFixed(1)}ms`
    );
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
//
// Pure content, no user/cookie dependency, so it's safe to cache across
// requests (unstable_cache) AND across the several times it's called
// within one render (React cache -- avoids re-hitting even the Data Cache
// layer for e.g. a page that needs both the lesson list and a lock check
// in the same request). See GRAMMAR_CONTENT_TAG for the invalidation story.
async function fetchLevelLessonSummaries(level: string): Promise<LessonSummaryRow[]> {
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

const getLevelLessonSummaries = cache(
  unstable_cache(fetchLevelLessonSummaries, ["grammar-level-lesson-summaries"], {
    tags: [GRAMMAR_CONTENT_TAG],
    revalidate: false,
  })
);

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

// Pure content fetch, no cookies/user dependency -- cacheable the same way
// as fetchLevelLessonSummaries. This is what generateStaticParams's pages
// call directly (see grammar/[level]/[slug]/page.tsx): a statically
// rendered page must never touch requireUserId()/cookies() itself or Next
// opts the whole route out of static generation.
async function fetchLessonContent(level: string, slug: string): Promise<GrammarLessonContent | null> {
  try {
    const dbLesson = await prisma.grammarLesson.findFirst({
      where: { slug, cefrLevel: { code: level } },
      include: { quizzes: { where: { type: "LESSON" }, take: 1 } },
    });
    if (dbLesson) {
      return {
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

  return findFallbackLesson(level, slug);
}

const getLessonContentCached = cache(
  unstable_cache(fetchLessonContent, ["grammar-lesson-content"], {
    tags: [GRAMMAR_CONTENT_TAG],
    revalidate: false,
  })
);

export async function getLessonContent(levelCode: string, slug: string): Promise<GrammarLessonContent | null> {
  return getLessonContentCached(normalizeLevelCode(levelCode), slug);
}

export type LessonLockInfo = {
  locked: boolean;
  prerequisiteTitleAr: string | null;
  levelProgress: { completed: number; total: number } | null;
};

// Deliberately dynamic (never cached): reads the caller's progress via
// getPassedLessonSlugs/requireUserId. Takes the prerequisite slug directly
// (rather than re-deriving it from getGrammarLesson) so the statically
// rendered lesson page can pass along what it already fetched instead of
// this doing a second content lookup.
export async function getLessonLockInfo(
  levelCode: string,
  prerequisiteSlug: string | null
): Promise<LessonLockInfo> {
  if (!prerequisiteSlug) {
    return { locked: false, prerequisiteTitleAr: null, levelProgress: null };
  }

  const level = normalizeLevelCode(levelCode);
  const passedPrereq = await getPassedLessonSlugs([prerequisiteSlug]);
  const locked = !passedPrereq.has(prerequisiteSlug);

  if (!locked) {
    return { locked: false, prerequisiteTitleAr: null, levelProgress: null };
  }

  // Only worth the extra queries once actually locked -- the gate UI needs
  // the prerequisite's Arabic title and the level's completion count, but
  // the far more common unlocked path has no use for either.
  const summaries = await getLevelLessonSummaries(level);
  const prerequisiteTitleAr = summaries.find((l) => l.slug === prerequisiteSlug)?.titleAr ?? null;
  const passed = await getPassedLessonSlugs(summaries.map((l) => l.slug));
  const levelProgress = { completed: passed.size, total: summaries.length };

  return { locked, prerequisiteTitleAr, levelProgress };
}

export type GrammarLessonView = GrammarLessonContent & LessonLockInfo;

// Convenience composition of the two above, for callers that need both
// content and lock status together and don't care about static rendering
// (the quiz page, and submitLessonQuizAttempt's server-side re-check).
export async function getGrammarLesson(levelCode: string, slug: string): Promise<GrammarLessonView | null> {
  const content = await getLessonContent(levelCode, slug);
  if (!content) return null;

  const lockInfo = await getLessonLockInfo(levelCode, content.prerequisite);
  return { ...content, ...lockInfo };
}

// All {level, slug} pairs that currently have lesson content, for
// generateStaticParams -- content-only, so it uses the cached summaries
// fetch rather than anything that would pull in a per-user progress query.
export async function getAllGrammarLessonParams(): Promise<{ level: string; slug: string }[]> {
  const params: { level: string; slug: string }[] = [];
  for (const code of CEFR_LEVEL_CODES) {
    const summaries = await getLevelLessonSummaries(code);
    for (const summary of summaries) {
      params.push({ level: code.toLowerCase(), slug: summary.slug });
    }
  }
  return params;
}

export type RoadmapLevelView = {
  code: string;
  name: string;
  totalLessons: number;
  completedLessons: number;
  state: "locked" | "available" | "completed";
};

type LevelTotals = {
  // Record instead of Map -- unstable_cache serializes the return value,
  // and a Map doesn't round-trip through JSON.
  totalsByCode: Record<string, number>;
  idToCode: Record<string, string>;
};

// Pure content: per-level lesson counts, plus the cefrLevelId -> code
// mapping (small, static reference data) so the per-user part below doesn't
// need a second query just to group its results by level.
async function fetchLevelTotals(): Promise<LevelTotals> {
  const totalsByCode: Record<string, number> = {};
  const idToCode: Record<string, string> = {};

  try {
    const levelRows = await prisma.cEFRLevel.findMany({ select: { id: true, code: true } });
    for (const row of levelRows) idToCode[row.id] = row.code;

    const totals = await prisma.grammarLesson.groupBy({
      by: ["cefrLevelId"],
      _count: { _all: true },
    });
    for (const row of totals) {
      const code = idToCode[row.cefrLevelId];
      if (code) totalsByCode[code] = row._count._all;
    }
  } catch {
    // DB unreachable -- caller falls through to the JSON-fallback count
    // (only A1 has fallback content, matching getLevelLessonSummaries's
    // own fallback).
  }

  return { totalsByCode, idToCode };
}

const getLevelTotals = cache(
  unstable_cache(fetchLevelTotals, ["grammar-level-totals"], {
    tags: [GRAMMAR_CONTENT_TAG],
    revalidate: false,
  })
);

export async function getRoadmap(): Promise<RoadmapLevelView[]> {
  const { totalsByCode, idToCode } = await getLevelTotals();
  const passedByCode = new Map<string, number>();

  // Per-user, so deliberately outside the cached totals fetch above --
  // and its own try/catch, so a failure here (or simply being logged out)
  // can't blank out the level totals too.
  let userId: string | null = null;
  try {
    userId = await requireUserId();
  } catch {
    // Not authenticated -- passedByCode stays empty (0 everywhere).
  }

  if (userId) {
    try {
      const passedLessons = await prisma.quizAttempt.findMany({
        where: { userId, passed: true, quiz: { type: "LESSON", lessonId: { not: null } } },
        distinct: ["quizId"], // a lesson can be attempted more than once; count it once
        select: { quiz: { select: { lesson: { select: { cefrLevelId: true } } } } },
      });
      for (const attempt of passedLessons) {
        const levelId = attempt.quiz.lesson?.cefrLevelId;
        const code = levelId ? idToCode[levelId] : undefined;
        if (code) passedByCode.set(code, (passedByCode.get(code) ?? 0) + 1);
      }
    } catch {
      // DB unreachable for the per-user part -- passedByCode stays empty.
    }
  }

  const levels: RoadmapLevelView[] = [];
  let previousCompleted = true; // A1 is always reachable

  for (const code of CEFR_LEVEL_CODES) {
    const total = totalsByCode[code] ?? LEVEL_FALLBACKS[code]?.lessons.length ?? 0;
    const completedCount = code in totalsByCode ? passedByCode.get(code) ?? 0 : 0;
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
