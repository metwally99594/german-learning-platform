"use client";

import { useEffect, useState } from "react";

export type AudioPlaybackProps = {
  blob: Blob;
};

export function AudioPlayback({ blob }: AudioPlaybackProps) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    const objectUrl = URL.createObjectURL(blob);
    setUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [blob]);

  if (!url) return null;

  return <audio controls src={url} />;
}
