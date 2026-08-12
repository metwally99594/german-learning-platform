"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Exercise } from "@prisma/client";
import { Clock, RotateCcw, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { RecordingControls } from "./recording-controls";
import { useSpeechRecognition } from "./use-speech-recognition";
import { useMediaRecorder } from "./use-media-recorder";
import { evaluateGermanSpeech, SpeechEvaluation } from "./evaluate-speech";
import { SpeechFeedback } from "./speech-feedback";
import { updateSpeakingProgress } from "@/server/actions/speaking-actions";

export type SpeakingSessionProps = {
  exercise: Exercise;
};

type Phase = "prep" | "recording" | "review";

export function SpeakingSession({ exercise }: SpeakingSessionProps) {
  const content = exercise.content as Record<string, unknown> | null;
  const prompt = typeof content?.prompt === "string" ? content.prompt : exercise.instructions;
  const prepTimeSeconds = typeof content?.prepTimeSeconds === "number" ? content.prepTimeSeconds : 180;
  const responseTimeSeconds =
    typeof content?.responseTimeSeconds === "number" ? content.responseTimeSeconds : 180;
  const usefulPhrases = Array.isArray(content?.usefulPhrases) ? content.usefulPhrases : [];
  const hints = Array.isArray(content?.hints) ? content.hints : [];

  const [phase, setPhase] = useState<Phase>("prep");
  const [prepRemaining, setPrepRemaining] = useState(prepTimeSeconds);
  const [recordingElapsedMs, setRecordingElapsedMs] = useState(0);
  const [evaluation, setEvaluation] = useState<SpeechEvaluation | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const speech = useSpeechRecognition();
  const recorder = useMediaRecorder();
  const recordingStartRef = useRef<number | null>(null);

  const maxRecordingMs = responseTimeSeconds * 1000;

  // Preparation countdown
  useEffect(() => {
    if (phase !== "prep" || prepRemaining <= 0) return;
    const interval = setInterval(() => {
      setPrepRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setPhase("recording");
          speech.start();
          recorder.start();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [phase, prepRemaining, recorder, speech]);

  // Recording elapsed time and auto-stop
  useEffect(() => {
    if (phase !== "recording") return;
    recordingStartRef.current = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - (recordingStartRef.current ?? Date.now());
      setRecordingElapsedMs(elapsed);
      if (elapsed >= maxRecordingMs) {
        stopAndEvaluate();
      }
    }, 100);
    return () => clearInterval(interval);
  }, [phase, maxRecordingMs]);

  const fullTranscript = useMemo(
    () => `${speech.transcript} ${speech.interimTranscript}`.trim(),
    [speech.transcript, speech.interimTranscript]
  );

  function handleStart() {
    setPhase("recording");
    recordingStartRef.current = Date.now();
    speech.start();
    recorder.start();
  }

  function stopAndEvaluate() {
    speech.stop();
    recorder.stop();
    const elapsedMs = Date.now() - (recordingStartRef.current ?? Date.now());
    const elapsedSec = Math.min(responseTimeSeconds, Math.max(1, Math.round(elapsedMs / 1000)));
    const currentTranscript = `${speech.transcript} ${speech.interimTranscript}`.trim();
    const result = evaluateGermanSpeech(currentTranscript, elapsedSec);
    setEvaluation(result);
    setPhase("review");
    setRecordingElapsedMs(0);
    recordingStartRef.current = null;
    saveProgress(result.score, elapsedSec);
  }

  async function saveProgress(score: number, durationSeconds: number) {
    setSaving(true);
    setSaveError(null);
    const response = await updateSpeakingProgress({
      score,
      timeSpentSeconds: durationSeconds,
      completed: false,
    });
    if (response?.error) {
      setSaveError(response.error);
    }
    setSaving(false);
  }

  function handleReset() {
    speech.reset();
    recorder.stop();
    setEvaluation(null);
    setPrepRemaining(prepTimeSeconds);
    setRecordingElapsedMs(0);
    setPhase("prep");
    setSaveError(null);
  }

  if (phase === "prep") {
    return (
      <div className="space-y-6 px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>{prompt}</CardTitle>
            <CardDescription>{exercise.instructions}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-center gap-2 rounded-xl bg-muted py-12 text-4xl font-bold">
              <Clock className="h-8 w-8" />
              {Math.floor(prepRemaining / 60)}:{(prepRemaining % 60).toString().padStart(2, "0")}
            </div>

            {usefulPhrases.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-semibold">Useful phrases</h3>
                <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                  {usefulPhrases.map((phrase, i) => (
                    <li key={i}>{phrase as string}</li>
                  ))}
                </ul>
              </div>
            )}

            {hints.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-semibold">Hints</h3>
                <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                  {hints.map((hint, i) => (
                    <li key={i}>{hint as string}</li>
                  ))}
                </ul>
              </div>
            )}

            <Button onClick={() => setPrepRemaining(0)} className="w-full">
              Start now
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (phase === "recording") {
    return (
      <div className="space-y-6 px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>{prompt}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <RecordingControls
              isRecording={speech.isListening || recorder.isRecording}
              isPaused={recorder.isPaused}
              onStart={handleStart}
              onStop={stopAndEvaluate}
              onPause={() => {
                recorder.pause();
                if (speech.isListening) speech.stop();
              }}
              elapsedMs={recordingElapsedMs}
              maxSeconds={responseTimeSeconds}
            />

            {(speech.error || recorder.error) && (
              <p className="text-sm text-destructive">{speech.error || recorder.error}</p>
            )}

            <div className="rounded-lg border bg-muted/50 p-4">
              <p className="text-sm text-muted-foreground">Live transcript</p>
              <p className="min-h-[4rem] whitespace-pre-wrap text-sm">
                {fullTranscript || "Start speaking…"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 px-4 py-8">
      {evaluation && <SpeechFeedback evaluation={evaluation} transcript={fullTranscript} />}

      {saveError && (
        <p className="text-sm text-destructive">{saveError}</p>
      )}

      <div className="flex gap-3">
        <Button onClick={handleReset} variant="outline" className="gap-2">
          <RotateCcw className="h-4 w-4" /> Try again
        </Button>

        {saving ? (
          <Button disabled className="gap-2">
            <CheckCircle className="h-4 w-4" /> Saving…
          </Button>
        ) : (
          <Button disabled className="gap-2">
            <CheckCircle className="h-4 w-4" /> Saved
          </Button>
        )}
      </div>
    </div>
  );
}
