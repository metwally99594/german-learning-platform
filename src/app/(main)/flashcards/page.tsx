import { Metadata } from "next";
import { getDueFlashcards } from "@/server/actions/flashcard-actions";
import { FlashcardReview } from "@/components/flashcards/flashcard-review";

export const metadata: Metadata = {
  title: "Flashcards",
  description: "Review your due vocabulary flashcards.",
};

export default async function FlashcardsPage() {
  const cards = await getDueFlashcards();

  return (
    <div className="mx-auto max-w-xl space-y-6 px-4 py-8">
      <div>
        <h1 className="text-3xl font-bold">Flashcards</h1>
        <p className="text-muted-foreground">Review vocabulary due today.</p>
      </div>

      {cards.length === 0 ? (
        <p className="text-muted-foreground">
          No flashcards are due right now. As you work through lessons, vocabulary you save will
          show up here for spaced-repetition review.
        </p>
      ) : (
        <FlashcardReview cards={cards} />
      )}
    </div>
  );
}
