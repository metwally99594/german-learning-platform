"use server";

import { prisma } from "@/lib/prisma";
import { Quiz, QuizQuestion, Lesson } from "@prisma/client";

export type QuizWithMeta = Quiz & { lesson: Lesson; questionCount: number };

export async function getQuizzes(): Promise<QuizWithMeta[]> {
  try {
    const quizzes = await prisma.quiz.findMany({
      include: { lesson: true, _count: { select: { questions: true } } },
      orderBy: { createdAt: "desc" },
    });
    return quizzes.map(({ _count, ...quiz }) => ({ ...quiz, questionCount: _count.questions }));
  } catch {
    return [];
  }
}

export type QuizWithQuestions = Quiz & { questions: QuizQuestion[] };

export async function getQuizById(id: string): Promise<QuizWithQuestions | null> {
  try {
    return await prisma.quiz.findUnique({
      where: { id },
      include: { questions: { orderBy: { order: "asc" } } },
    });
  } catch {
    return null;
  }
}
