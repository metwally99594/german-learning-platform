"use server";

import { prisma } from "@/lib/prisma";
import { CEFRLevel, Lesson, GrammarTopic, VocabularyWord, Quiz } from "@prisma/client";

export type LessonWithLevel = Lesson & { cefrLevel: CEFRLevel };

export async function getLessons(): Promise<LessonWithLevel[]> {
  try {
    return await prisma.lesson.findMany({
      include: { cefrLevel: true },
      orderBy: [{ cefrLevel: { order: "asc" } }, { order: "asc" }],
    });
  } catch {
    return [];
  }
}

export type LessonDetail = Lesson & {
  cefrLevel: CEFRLevel;
  grammarTopics: GrammarTopic[];
  vocabulary: VocabularyWord[];
  quizzes: Quiz[];
};

export async function getLessonById(id: string): Promise<LessonDetail | null> {
  try {
    return await prisma.lesson.findUnique({
      where: { id },
      include: {
        cefrLevel: true,
        grammarTopics: { orderBy: { order: "asc" } },
        vocabulary: true,
        quizzes: true,
      },
    });
  } catch {
    return null;
  }
}
