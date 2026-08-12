"use client";

import { Button } from "@/components/ui/button";

export type ReorderQuestionInputProps = {
  words: string[];
  value: string;
  onChange: (value: string) => void;
};

export function ReorderQuestionInput({ words, value, onChange }: ReorderQuestionInputProps) {
  const selected = value ? value.split(" ") : [];
  const remaining = [...words];
  for (const word of selected) {
    const index = remaining.indexOf(word);
    if (index !== -1) remaining.splice(index, 1);
  }

  const addWord = (word: string) => onChange([...selected, word].join(" "));
  const removeLast = () => onChange(selected.slice(0, -1).join(" "));
  const reset = () => onChange("");

  return (
    <div dir="ltr" className="space-y-2 text-left">
      <div className="flex min-h-10 flex-wrap gap-2 rounded-md border border-dashed p-2">
        {selected.length === 0 && (
          <span className="text-sm text-muted-foreground">Click the words in order</span>
        )}
        {selected.map((word, index) => (
          <span key={index} className="rounded-md bg-primary px-2 py-1 text-sm text-primary-foreground">
            {word}
          </span>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {remaining.map((word, index) => (
          <button
            key={index}
            type="button"
            onClick={() => addWord(word)}
            className="rounded-md border px-2 py-1 text-sm hover:bg-accent"
          >
            {word}
          </button>
        ))}
      </div>
      {selected.length > 0 && (
        <div className="flex gap-2">
          <Button type="button" variant="outline" size="sm" onClick={removeLast}>
            Undo
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={reset}>
            Reset
          </Button>
        </div>
      )}
    </div>
  );
}
