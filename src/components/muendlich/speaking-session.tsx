"use client";

import { useEffect, useRef, useState } from "react";
import { Exercise } from "@prisma/client";
import { RubricItem, SpeakingExerciseContent } from "@/types";
import { updateSpeakingProgress } from "@/server/actions/speaking-actions";
import { Button } from "@/components/ui/button";
import { PromptCard } from "./prompt-card";
import { PrepTimer } from "./prep-timer";
import { RecordingControls } from "./recording-controls";
import { AudioPlayback } from "./audio-playback";
import { ModelAnswerPanel } from "./model-answer-panel";
import { SelfAssessment } from "./self-assessment";
import { useMediaRecorder } from "./use-media-recorder";
import { useSpeechRecognition } from "./use-speech-recognition";
import { useCountdown } from "./use-countdown";
import { evaluateGermanSpeech, SpeechEvaluation } from "./evaluate-speech";
import { SpeechFeedback } from "./speech-feedback";
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
  const [evaluation, setEvaluation] = useState<SpeechEvaluation | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const speech = useSpeechRecognition();
  const { start, stop, pause, blob, error, isRecording, isPaused } = useMediaRecorder();
  const recordingStartRef = useRef<number | null>(null);

  const responseTimer = useCountdown(content.responseTimeSeconds, handleStopRecording);

  const elapsedMs = (content.responseTimeSeconds - responseTimer.remaining) * 1000;

  function handleStartRecording() {
    recordingStartRef.current = Date.now();
    speech.start();
    void start();
    responseTimer.start();
  }

  function handleStopRecording() {
    speech.stop();
    stop();
    responseTimer.pause();

    const elapsedMs = Date.now() - (recordingStartRef.current ?? Date.now());
    const elapsedSec = Math.min(
      content.responseTimeSeconds,
      Math.max(1, Math.round(elapsedMs / 1000))
    );
    const transcript = `${speech.transcript} ${speech.interimTranscript}`.trim();
    const result = evaluateGermanSpeech(transcript, elapsedSec);
    setEvaluation(result);
    setPhase("review");

    void saveProgress(result.score, elapsedSec);
  }

  async function saveProgress(score: number, timeSpentSeconds: number) {
    setSaving(true);
    const result = await updateSpeakingProgress({
      score,
      timeSpentSeconds,
      completed: false,
    });
    setSaveMessage(result.error ?? "Fortschritt gespeichert.");
    setSaving(false);
  }

  function handleReset() {
    speech.reset();
    stop();
    responseTimer.reset(content.responseTimeSeconds);
    setPhase("idle");
    setRevealed(false);
    setEvaluation(null);
    setSaveMessage(null);
    recordingStartRef.current = null;
  }

  // Auto-stop when response timer reaches zero.
  useEffect(() => {
    if (phase === "recording" && responseTimer.remaining === 0 && responseTimer.isRunning === false) {
      handleStopRecording();
    }
  }, [phase, responseTimer.remaining, responseTimer.isRunning]);

  const fullTranscript = `${speech.transcript} ${speech.interimTranscript}`.trim();

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
        <Button onClick={() => setPhase("prep")}>Übung starten</Button>
      )}

      {phase === "prep" && (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Vorbereitungszeit</p>
          <PrepTimer seconds={content.prepTimeSeconds} onComplete={() => setPhase("recording")} />
          <Button variant="outline" onClick={() => setPhase("recording")}>Jetzt starten</Button>
        </div>
      )}

      {(phase === "recording" || phase === "review") && (
        <div className="space-y-4">
          <RecordingControls
            isRecording={isRecording || speech.isListening}
            isPaused={isPaused}
            onStart={handleStartRecording}
            onStop={handleStopRecording}
            onPause={() => {
              pause();
              if (speech.isListening) speech.stop();
            }}
            elapsedMs={elapsedMs}
            maxSeconds={content.responseTimeSeconds}
          />

          {phase === "recording" && (
            <div className="rounded-lg border bg-muted/50 p-4">
              <p className="text-sm text-muted-foreground">Live transcript</p>
              <p className="min-h-[4rem] whitespace-pre-wrap text-sm">
                {fullTranscript || "Start speaking…"}
              </p>
            </div>
          )}
        </div>
      )}

      {(error || speech.error) && (
        <p className="text-sm text-destructive">{error || speech.error}</p>
      )}

      {phase === "review" && blob && <AudioPlayback blob={blob} />}

      {phase === "review" && evaluation && (
        <SpeechFeedback evaluation={evaluation} transcript={fullTranscript} />
      )}

      {phase === "review" && !revealed && (
        <Button variant="outline" onClick={() => setRevealed(true)}>
          Musterantwort anzeigen
        </Button>
      )}

      {revealed && (
        <>
          <ModelAnswerPanel
            modelAnswer={content.modelAnswer}
            phrases={content.usefulPhrases}
            rubric={rubric}
          />
          <SelfAssessment rubric={rubric} onRate={() => {}} />
        </>
      )}

      {phase === "review" && (
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={handleReset}>Noch einmal versuchen</Button>
          {saveMessage && (
            <p className="text-sm text-muted-foreground">{saveMessage} {saving && "(speichert…)"}</p>
          )}
        </div>
      )}

      {sessionMins && (
        <p className="text-sm text-muted-foreground">Session length: {sessionMins} min</p>
      )}
    </div>
  );
}
