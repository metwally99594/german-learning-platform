"use server";

import { revalidatePath } from "next/cache";
import { Exercise } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { SpeakingPart } from "@/types";
import fallbackData from "@/data/speaking-exercises.json";

const C1_SPEAKING_LESSON_TITLE = "C1 Mündliche Prüfung";

export async function getSpeakingExercisesByPart(part: SpeakingPart): Promise<Exercise[]> {
  try {
    const lesson = await prisma.lesson.findFirst({
      where: { title: C1_SPEAKING_LESSON_TITLE },
      include: {
        exercises: {
          where: { type: "SPEAKING" },
          orderBy: { order: "asc" },
        },
      },
    });

    if (!lesson) {
      return fallbackToJson(part);
    }

    const exercises = lesson.exercises.filter((exercise) => {
      const content = exercise.content as Record<string, unknown> | null;
      return content?.part === part;
    });

    return exercises.length > 0 ? exercises : fallbackToJson(part);
  } catch {
    return fallbackToJson(part);
  }
}

export async function getSpeakingExerciseById(id: string): Promise<Exercise | null> {
  try {
    const exercise = await prisma.exercise.findUnique({
      where: { id },
    });

    if (exercise) {
      return exercise;
    }
  } catch {
    // Fall through to JSON fallback below.
  }

  const fallback = fallbackData.exercises.find((exercise) => exercise.id === id);

  if (!fallback) {
    return null;
  }

  return {
    id: fallback.id,
    lessonId: "fallback",
    type: "SPEAKING",
    instructions: fallback.instructions,
    content: {
      part: fallback.part,
      prompt: fallback.prompt,
      stimulus: fallback.stimulus,
      prepTimeSeconds: fallback.prepTimeSeconds,
      responseTimeSeconds: fallback.responseTimeSeconds,
      modelAnswer: fallback.modelAnswer,
      usefulPhrases: fallback.usefulPhrases,
      hints: fallback.hints,
    },
    answerKey: fallback.rubric,
    order: 0,
  };
}

export async function updateSpeakingProgress({
  userId,
  score,
  timeSpentSeconds,
  completed = true,
}: {
  userId: string;
  score?: number;
  timeSpentSeconds?: number;
  completed?: boolean;
}) {
  try {
    const lesson = await prisma.lesson.findFirst({
      where: { title: C1_SPEAKING_LESSON_TITLE },
    });

    if (!lesson) {
      return { error: "C1 speaking lesson not found" };
    }

    await prisma.userProgress.upsert({
      where: {
        userId_lessonId: {
          userId,
          lessonId: lesson.id,
        },
      },
      create: {
        userId,
        lessonId: lesson.id,
        completed,
        score: score ?? 0,
        timeSpentSeconds: timeSpentSeconds ?? 0,
      },
      update: {
        score: {
          set: score,
        },
        timeSpentSeconds: {
          increment: timeSpentSeconds ?? 0,
        },
        completed,
      },
    });

    revalidatePath("/mündlich");
    return { success: true };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Failed to update progress",
    };
  }
}

function fallbackToJson(part: SpeakingPart): Exercise[] {
  return fallbackData.exercises
    .filter((exercise) => exercise.part === part)
    .map((exercise) => ({
      id: exercise.id,
      lessonId: "fallback",
      type: "SPEAKING" as const,
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
      order: 0,
    }));
}
