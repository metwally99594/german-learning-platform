"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUserId, NotAuthenticatedError } from "@/lib/auth/session";
import { Flashcard, VocabularyWord } from "@prisma/client";

export type DueFlashcard = Flashcard & { vocabularyWord: VocabularyWord };

export async function getDueFlashcards(): Promise<DueFlashcard[]> {
  let userId: string;
  try {
    userId = await requireUserId();
  } catch {
    return [];
  }

  try {
    return await prisma.flashcard.findMany({
      where: { userId, dueDate: { lte: new Date() } },
      include: { vocabularyWord: true },
      orderBy: { dueDate: "asc" },
      take: 20,
    });
  } catch {
    return [];
  }
}

export type FlashcardRating = "again" | "good" | "easy";

const RATING_EASE_DELTA: Record<FlashcardRating, number> = {
  again: -0.2,
  good: 0,
  easy: 0.15,
};

const MIN_EASE_FACTOR = 1.3;

export async function rateFlashcard(flashcardId: string, rating: FlashcardRating) {
  let userId: string;
  try {
    userId = await requireUserId();
  } catch (error) {
    if (error instanceof NotAuthenticatedError) {
      return { error: "You must be signed in to review flashcards." };
    }
    return { error: "Failed to verify your account. Please try again." };
  }

  try {
    const flashcard = await prisma.flashcard.findUnique({ where: { id: flashcardId } });

    if (!flashcard || flashcard.userId !== userId) {
      return { error: "Flashcard not found." };
    }

    const nextEase = Math.max(MIN_EASE_FACTOR, flashcard.easeFactor + RATING_EASE_DELTA[rating]);
    const nextInterval =
      rating === "again" ? 1 : Math.max(1, Math.round((flashcard.interval || 1) * nextEase));
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + nextInterval);

    await prisma.flashcard.update({
      where: { id: flashcardId },
      data: {
        easeFactor: nextEase,
        interval: nextInterval,
        dueDate,
        reps: { increment: 1 },
      },
    });

    revalidatePath("/flashcards");
    return { success: true };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Failed to update flashcard",
    };
  }
}
