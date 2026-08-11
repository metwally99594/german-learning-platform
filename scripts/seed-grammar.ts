import { readdirSync } from "fs";
import { join } from "path";
import { PrismaClient } from "@prisma/client";
import type { GrammarLevelFile } from "../src/types/grammar";

const prisma = new PrismaClient();

const LEVEL_NAMES: Record<string, string> = {
  A1: "A1 - Beginner",
  A2: "A2 - Elementary",
  B1: "B1 - Intermediate",
  B2: "B2 - Upper Intermediate",
  C1: "C1 - Advanced",
};

const LEVEL_ORDER: Record<string, number> = { A1: 1, A2: 2, B1: 3, B2: 4, C1: 5 };

function loadLevelFiles(): GrammarLevelFile[] {
  const dataDir = join(process.cwd(), "src", "data");
  const files = readdirSync(dataDir).filter((f) => /^grammar-[a-z0-9]+\.json$/.test(f));
  return files.map((file) => require(join(dataDir, file)) as GrammarLevelFile);
}

async function main() {
  const levelFiles = loadLevelFiles();

  if (levelFiles.length === 0) {
    console.log("No grammar-<level>.json files found in src/data. Nothing to seed.");
    return;
  }

  let totalLessons = 0;

  for (const file of levelFiles) {
    const code = file.level.toUpperCase();

    const cefrLevel = await prisma.cEFRLevel.upsert({
      where: { code },
      update: {},
      create: {
        code,
        name: LEVEL_NAMES[code] ?? code,
        order: LEVEL_ORDER[code] ?? 0,
      },
    });

    for (const lesson of file.lessons) {
      const grammarLesson = await prisma.grammarLesson.upsert({
        where: { slug: lesson.slug },
        update: {
          cefrLevelId: cefrLevel.id,
          weekNumber: lesson.weekNumber,
          orderInLevel: lesson.orderInLevel,
          titleAr: lesson.titleAr,
          titleDe: lesson.titleDe,
          ruleDe: lesson.ruleDe,
          explanationAr: lesson.explanationAr,
          examples: lesson.examples,
          story: lesson.story,
          prerequisite: lesson.prerequisite,
        },
        create: {
          cefrLevelId: cefrLevel.id,
          slug: lesson.slug,
          weekNumber: lesson.weekNumber,
          orderInLevel: lesson.orderInLevel,
          titleAr: lesson.titleAr,
          titleDe: lesson.titleDe,
          ruleDe: lesson.ruleDe,
          explanationAr: lesson.explanationAr,
          examples: lesson.examples,
          story: lesson.story,
          prerequisite: lesson.prerequisite,
        },
      });

      const existingQuiz = await prisma.grammarQuiz.findFirst({
        where: { lessonId: grammarLesson.id, type: "LESSON" },
      });

      const quizData = {
        type: lesson.quiz.type,
        passingScore: lesson.quiz.passingScore,
        questions: lesson.quiz.questions,
      };

      if (existingQuiz) {
        await prisma.grammarQuiz.update({ where: { id: existingQuiz.id }, data: quizData });
      } else {
        await prisma.grammarQuiz.create({
          data: { ...quizData, lessonId: grammarLesson.id },
        });
      }

      totalLessons += 1;
    }

    console.log(`Seeded ${file.lessons.length} lessons for level ${code}.`);
  }

  console.log(`Done. ${totalLessons} grammar lessons seeded total.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
