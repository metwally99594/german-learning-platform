"use client";

import { Mic, Square, Pause, Play } from "lucide-react";
import { Button } from "@/components/ui/button";

export type RecordingControlsProps = {
  isRecording: boolean;
  isPaused: boolean;
  onStart: () => void;
  onStop: () => void;
  onPause: () => void;
  elapsedMs: number;
  maxSeconds?: number;
};

function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
}

export function RecordingControls({
  isRecording,
  isPaused,
  onStart,
  onStop,
  onPause,
  elapsedMs,
  maxSeconds,
}: RecordingControlsProps) {
  const progress = maxSeconds ? Math.min(100, (elapsedMs / 1000 / maxSeconds) * 100) : 0;

  return (
    <div className="space-y-3 rounded-xl border bg-card p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {isRecording ? (
            <Button variant="destructive" size="icon" onClick={onStop} aria-label="Stop recording">
              <Square className="h-4 w-4 fill-current" />
            </Button>
          ) : (
            <Button size="icon" onClick={onStart} aria-label="Start recording">
              <Mic className="h-4 w-4" />
            </Button>
          )}

          {isRecording && (
            <Button variant="outline" size="icon" onClick={onPause} aria-label="Pause or resume">
              {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
            </Button>
          )}
        </div>

        <span className="text-2xl font-mono font-bold tabular-nums">{formatDuration(elapsedMs)}</span>
      </div>

      {maxSeconds && (
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full bg-primary transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        {isRecording
          ? "Speak clearly in German. The browser transcribes your speech locally."
          : "Click the microphone to start your 3-minute presentation."}
      </p>
    </div>
  );
}
