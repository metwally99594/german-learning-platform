/**
 * Exports the grammar curriculum from the database back into
 * src/data/grammar-<level>.json -- the reverse of seed-grammar.ts.
 *
 * The database is the source of truth: content was seeded there directly,
 * so the JSON files in the repo can drift. Run this to bring them back
 * in sync, and commit the result as a version-controlled backup.
 *
 * Usage:  npx tsx scripts/export-grammar.ts
 * Needs:  DATABASE_URL in the environment.
 */

import { PrismaClient } from "@prisma/client";
import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import type {
  GrammarExample,
  GrammarExamFile,
  GrammarLevelFile,
  GrammarQuizQuestion,
  GrammarStory,
} from "../src/types/grammar";

const prisma = new PrismaClient();
const OUT_DIR = path.join(process.cwd(), "src", "data");

async function main() {
  const levels = await prisma.cEFRLevel.findMany({
    orderBy: { order: "asc" },
  });

  await mkdir(OUT_DIR, { recursive: true });

  let totalLessons = 0;
  let totalQuizzes = 0;
  let skippedLessons = 0;

  for (const level of levels) {
    const lessons = await prisma.grammarLesson.findMany({
      where: { cefrLevelId: level.id },
      orderBy: { orderInLevel: "asc" },
      include: { quizzes: { where: { type: "LESSON" }, take: 1 } },
    });

    // Level-wide exams (WEEKLY / LEVEL / FINAL) aren't tied to a lesson.
    const levelQuizzes = await prisma.grammarQuiz.findMany({
      where: { cefrLevelId: level.id, lessonId: null },
      orderBy: [{ type: "asc" }, { weekNumber: "asc" }],
    });

    // A lesson with no LESSON-type quiz can't be exported: GrammarLessonContent.quiz
    // is non-nullable (see src/types/grammar.ts), and the JSON-fallback read path in
    // grammar-actions.ts trusts that unconditionally -- unlike the DB-read path, which
    // already tolerates a missing quiz. Writing `quiz: null` here would just move the
    // crash to whoever reads this file as fallback content later. Skip and warn loudly
    // instead; a lesson with no quiz is a data problem worth fixing at the source, not
    // silently exporting.
    const exportableLessons = lessons.filter((l) => l.quizzes.length > 0);
    const missingQuiz = lessons.filter((l) => l.quizzes.length === 0);
    if (missingQuiz.length > 0) {
      skippedLessons += missingQuiz.length;
      console.warn(
        `WARNING: ${level.code} has ${missingQuiz.length} lesson(s) with no LESSON-type ` +
          `quiz, skipped from export: ${missingQuiz.map((l) => l.slug).join(", ")}`
      );
    }

    if (exportableLessons.length === 0 && levelQuizzes.length === 0) continue;

    const payload: GrammarLevelFile = {
      level: level.code,
      exportedAt: new Date().toISOString(),
      lessons: exportableLessons.map((l) => ({
        slug: l.slug,
        weekNumber: l.weekNumber,
        orderInLevel: l.orderInLevel,
        titleDe: l.titleDe,
        titleAr: l.titleAr,
        prerequisite: l.prerequisite,
        ruleDe: l.ruleDe,
        explanationAr: l.explanationAr,
        examples: l.examples as unknown as GrammarExample[],
        story: l.story as unknown as GrammarStory,
        // A lesson has at most one LESSON-type quiz (filtered above); keep it
        // nested so the shape matches what seed-grammar.ts already expects.
        quiz: {
          type: l.quizzes[0].type,
          passingScore: l.quizzes[0].passingScore,
          questions: l.quizzes[0].questions as unknown as GrammarQuizQuestion[],
        },
      })),
      exams: levelQuizzes.map(
        (q): GrammarExamFile => ({
          type: q.type as GrammarExamFile["type"],
          weekNumber: q.weekNumber,
          passingScore: q.passingScore,
          questions: q.questions as unknown as GrammarQuizQuestion[],
        })
      ),
    };

    const file = path.join(OUT_DIR, `grammar-${level.code.toLowerCase()}.json`);
    await writeFile(file, JSON.stringify(payload, null, 2) + "\n", "utf8");

    const quizCount = exportableLessons.length + levelQuizzes.length;
    totalLessons += exportableLessons.length;
    totalQuizzes += quizCount;

    console.log(
      `${level.code}: ${exportableLessons.length} lessons, ${quizCount} quizzes -> ${path.relative(process.cwd(), file)}`
    );
  }

  if (totalLessons === 0) {
    console.warn("No grammar content found. Is DATABASE_URL pointing at the right database?");
    return;
  }

  console.log(`\nDone. ${totalLessons} lessons and ${totalQuizzes} quizzes exported.`);
  if (skippedLessons > 0) {
    console.warn(`${skippedLessons} lesson(s) skipped due to a missing quiz -- see warnings above.`);
  }
}

main()
  .catch((err) => {
    console.error("Export failed:", err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
