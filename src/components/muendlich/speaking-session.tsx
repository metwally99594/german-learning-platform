import { Exercise } from "@prisma/client";

export type SpeakingSessionProps = {
  exercise: Exercise;
  sessionMins?: number;
};

export function SpeakingSession({ exercise, sessionMins }: SpeakingSessionProps) {
  return (
    <div className="space-y-6 px-4 py-8">
      <h1 className="text-2xl font-bold">Speaking practice</h1>
      <p className="text-muted-foreground">{exercise.instructions}</p>
      {sessionMins && <p className="text-sm text-muted-foreground">Session length: {sessionMins} min</p>}
    </div>
  );
}
