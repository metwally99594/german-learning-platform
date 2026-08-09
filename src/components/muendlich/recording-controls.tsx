"use client";

export type RecordingControlsProps = {
  isRecording: boolean;
  isPaused: boolean;
  onStart: () => void;
  onStop: () => void;
  onPause: () => void;
  elapsedMs: number;
};

export function RecordingControls({
  isRecording,
  isPaused,
  onStart,
  onStop,
  onPause,
  elapsedMs,
}: RecordingControlsProps) {
  return (
    <div className="flex items-center gap-4">
      {isRecording ? (
        <button onClick={onStop}>Stop</button>
      ) : (
        <button onClick={onStart}>Record</button>
      )}
      {isRecording && <button onClick={onPause}>{isPaused ? "Resume" : "Pause"}</button>}
      <span>{Math.round(elapsedMs / 1000)}s</span>
    </div>
  );
}
