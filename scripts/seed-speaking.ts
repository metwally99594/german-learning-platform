import { PrismaClient } from "@prisma/client";
import fallbackData from "../src/data/speaking-exercises.json";

const prisma = new PrismaClient();

const C1_SPEAKING_LESSON_TITLE = "C1 Mündliche Prüfung";

async function main() {
  const c1Level = await prisma.cEFRLevel.upsert({
    where: { code: "C1" },
    update: {},
    create: {
      code: "C1",
      name: "C1 - Advanced",
      description: "Can understand a wide range of demanding, longer texts and recognise implicit meaning.",
      order: 5,
    },
  });

  let lesson = await prisma.lesson.findFirst({
    where: { title: C1_SPEAKING_LESSON_TITLE },
  });

  if (!lesson) {
    lesson = await prisma.lesson.create({
      data: {
        cefrLevelId: c1Level.id,
        title: C1_SPEAKING_LESSON_TITLE,
        description: "Practise the four tasks of the German C1 oral exam.",
        order: 1,
        estimatedMinutes: 30,
      },
    });
  }

  for (const exercise of fallbackData.exercises) {
    await prisma.exercise.upsert({
      where: { id: exercise.id },
      update: {
        lessonId: lesson.id,
        instructions: exercise.instructions,
        content: {
          part: exercise.part,
          prompt: exercise.prompt,
          stimulus: exercise.stimulus,
          prepTimeSeconds: exercise.prepTimeSeconds,
          responseTimeSeconds: exercise.responseTimeSeconds,
          modelAnswer: exercise.modelAnswer,
          usefulPhrases: exercise.usefulPhrases,
          hints: exercise.hints,
        },
        answerKey: exercise.rubric,
        order: exercise.order,
      },
      create: {
        id: exercise.id,
        lessonId: lesson.id,
        type: "SPEAKING",
        instructions: exercise.instructions,
        content: {
          part: exercise.part,
          prompt: exercise.prompt,
          stimulus: exercise.stimulus,
          prepTimeSeconds: exercise.prepTimeSeconds,
          responseTimeSeconds: exercise.responseTimeSeconds,
          modelAnswer: exercise.modelAnswer,
          usefulPhrases: exercise.usefulPhrases,
          hints: exercise.hints,
        },
        answerKey: exercise.rubric,
        order: exercise.order,
      },
    });
  }

  console.log(`Seeded ${fallbackData.exercises.length} speaking exercises for lesson ${lesson.id}.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
