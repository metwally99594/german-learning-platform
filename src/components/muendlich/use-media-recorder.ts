"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type UseMediaRecorderReturn = {
  start: () => Promise<void>;
  stop: () => void;
  pause: () => void;
  blob: Blob | null;
  error: string | null;
  isRecording: boolean;
  isPaused: boolean;
};

export function useMediaRecorder(): UseMediaRecorderReturn {
  const [blob, setBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const stopTracks = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }, []);

  const start = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mimeType = MediaRecorder.isTypeSupported("audio/webm") ? "audio/webm" : "";
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      recorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const actualMimeType = recorder.mimeType || mimeType || "audio/webm";
        setBlob(new Blob(chunksRef.current, { type: actualMimeType }));
        stopTracks();
      };

      recorder.start();
      setIsRecording(true);
      setIsPaused(false);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Microphone access denied");
    }
  }, [stopTracks]);

  const stop = useCallback(() => {
    recorderRef.current?.stop();
    setIsRecording(false);
    setIsPaused(false);
  }, []);

  const pause = useCallback(() => {
    const recorder = recorderRef.current;
    if (!recorder) return;
    if (recorder.state === "recording") {
      recorder.pause();
      setIsPaused(true);
    } else if (recorder.state === "paused") {
      recorder.resume();
      setIsPaused(false);
    }
  }, []);

  useEffect(() => {
    return () => {
      recorderRef.current?.stop();
      stopTracks();
    };
  }, [stopTracks]);

  return { start, stop, pause, blob, error, isRecording, isPaused };
}
