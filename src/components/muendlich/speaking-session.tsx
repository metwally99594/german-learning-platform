"use client";

import { useState } from "react";
import { Exercise } from "@prisma/client";
import { RubricItem, SpeakingExerciseContent } from "@/types";
import { updateSpeakingProgress } from "@/server/actions/speaking-actions";
import { PromptCard } from "./prompt-card";
import { PrepTimer } from "./prep-timer";
import { RecordingControls } from "./recording-controls";
import { AudioPlayback } from "./audio-playback";
import { ModelAnswerPanel } from "./model-answer-panel";
import { SelfAssessment } from "./self-assessment";
import { useMediaRecorder } from "./use-media-recorder";
import { useCountdown } from "./use-countdown";
import { partTitles } from "@/lib/muendlich/format";

export type SpeakingSessionProps = {
  exercise: Exercise;
  sessionMins?: number;
};

type Phase = "idle" | "prep" | "recording" | "review";

export function SpeakingSession({ exercise, sessionMins }: SpeakingSessionProps) {
  const content = exercise.content as unknown as SpeakingExerciseContent;
  const rubric = (exercise.answerKey as unknown as RubricItem[]) ?? [];

  const [phase, setPhase] = useState<Phase>("idle");
  const [revealed, setRevealed] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const { start, stop, pause, blob, error, isRecording, isPaused } = useMediaRecorder();

  const handleStopRecording = () => {
    stop();
    responseTimer.pause();
    setPhase("review");
  };

  const responseTimer = useCountdown(content.responseTimeSeconds, handleStopRecording);

  const handleStartRecording = async () => {
    await start();
    responseTimer.start();
  };

  const handleRate = async () => {
    const timeSpentSeconds = content.responseTimeSeconds - responseTimer.remaining;
    const result = await updateSpeakingProgress({ completed: true, timeSpentSeconds });
    setSaveMessage(result.error ?? "Fortschritt gespeichert.");
  };

  const elapsedMs = (content.responseTimeSeconds - responseTimer.remaining) * 1000;

  return (
    <div className="space-y-6 px-4 py-8">
      <PromptCard
        title={partTitles[content.part]}
        stimulus={content.stimulus}
        chart={content.chart}
        prompt={content.prompt}
        instructions={exercise.instructions}
      />

      {phase === "idle" && (
        <button
          onClick={() => setPhase("prep")}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          Übung starten
        </button>
      )}

      {phase === "prep" && (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Vorbereitungszeit</p>
          <PrepTimer seconds={content.prepTimeSeconds} onComplete={() => setPhase("recording")} />
        </div>
      )}

      {(phase === "recording" || phase === "review") && (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Sprechzeit</p>
          <RecordingControls
            isRecording={isRecording}
            isPaused={isPaused}
            onStart={handleStartRecording}
            onStop={handleStopRecording}
            onPause={pause}
            elapsedMs={elapsedMs}
          />
        </div>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}

      {phase === "review" && blob && <AudioPlayback blob={blob} />}

      {phase === "review" && !revealed && (
        <button
          onClick={() => setRevealed(true)}
          className="rounded-md border px-4 py-2 text-sm font-medium"
        >
          Musterantwort anzeigen
        </button>
      )}

      {revealed && (
        <>
          <ModelAnswerPanel
            modelAnswer={content.modelAnswer}
            phrases={content.usefulPhrases}
            rubric={rubric}
          />
          <SelfAssessment rubric={rubric} onRate={handleRate} />
          {saveMessage && <p className="text-sm text-muted-foreground">{saveMessage}</p>}
        </>
      )}

      {sessionMins && <p className="text-sm text-muted-foreground">Session length: {sessionMins} min</p>}
    </div>
  );
}
