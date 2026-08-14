"use client";

import { KeyboardEvent, MouseEvent, useEffect, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { cn } from "@/lib/utils";

type SpeakableTextProps = { text: string; className?: string; label?: string };

export function SpeakableText({ text, className, label = "Play German pronunciation" }: SpeakableTextProps) {
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => () => window.speechSynthesis?.cancel(), []);

  function speak(event?: MouseEvent<HTMLButtonElement> | KeyboardEvent<HTMLButtonElement>) {
    event?.stopPropagation();
    if (!("speechSynthesis" in window)) return;
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }
    const selectedText = window.getSelection()?.toString().trim();
    const utterance = new SpeechSynthesisUtterance(selectedText || text);
    utterance.lang = "de-DE";
    utterance.rate = 0.85;
    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  }

  return (
    <button
      type="button"
      dir="ltr"
      title={label}
      aria-label={`${label}: ${text}`}
      onClick={speak}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") speak(event);
      }}
      className={cn(
        "group inline-flex max-w-full items-start gap-2 rounded-md text-left transition-colors hover:bg-primary/10 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
        speaking && "bg-primary/10 text-primary",
        className
      )}
    >
      {speaking ? <VolumeX className="mt-1 h-4 w-4 shrink-0" /> : <Volume2 className="mt-1 h-4 w-4 shrink-0 opacity-60 group-hover:opacity-100" />}
      <span className="whitespace-pre-wrap">{text}</span>
    </button>
  );
}
