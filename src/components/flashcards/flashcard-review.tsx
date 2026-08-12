"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DueFlashcard, rateFlashcard } from "@/server/actions/flashcard-actions";

export type FlashcardReviewProps = {
  cards: DueFlashcard[];
};

export function FlashcardReview({ cards }: FlashcardReviewProps) {
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [done, setDone] = useState(false);

  const current = cards[index];

  const handleRate = async (rating: "again" | "good" | "easy") => {
    await rateFlashcard(current.id, rating);
    if (index + 1 >= cards.length) {
      setDone(true);
      return;
    }
    setIndex(index + 1);
    setRevealed(false);
  };

  if (done || !current) {
    return (
      <Card className="border-border/50 bg-card/70 backdrop-blur-md">
        <CardContent className="space-y-2 py-8 text-center">
          <p className="text-lg font-medium">Alle Karten für heute geschafft!</p>
          <p className="text-sm text-muted-foreground">Come back tomorrow for more due cards.</p>
        </CardContent>
      </Card>
    );
  }

  const word = current.vocabularyWord;

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Card {index + 1} of {cards.length}
      </p>

      <Card
        className="min-h-48 cursor-pointer border-border/50 bg-card/70 backdrop-blur-md"
        onClick={() => setRevealed(true)}
      >
        <CardContent className="flex min-h-48 flex-col items-center justify-center gap-3 py-8 text-center">
          <p className="text-2xl font-bold">
            {word.article ? `${word.article} ` : ""}
            {word.german}
          </p>
          {word.plural && <p className="text-sm text-muted-foreground">Plural: {word.plural}</p>}

          {revealed ? (
            <div className="mt-4 space-y-1 border-t border-border/40 pt-4">
              <p className="text-lg">{word.englishTranslation}</p>
              {word.arabicTranslation && (
                <p className="text-sm text-muted-foreground">{word.arabicTranslation}</p>
              )}
              {word.exampleSentence && (
                <p className="text-sm italic text-muted-foreground">{word.exampleSentence}</p>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Tap the card to reveal the translation.</p>
          )}
        </CardContent>
      </Card>

      {revealed && (
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={() => handleRate("again")}>
            Nochmal
          </Button>
          <Button variant="outline" className="flex-1" onClick={() => handleRate("good")}>
            Gut
          </Button>
          <Button variant="outline" className="flex-1" onClick={() => handleRate("easy")}>
            Einfach
          </Button>
        </div>
      )}
    </div>
  );
}
