import { Exercise } from "@prisma/client";
import { SpeakingExerciseContent, SpeakingPart } from "@/types";

export const partTitles: Record<SpeakingPart, string> = {
  "praesentation-a": "Präsentation A",
  "praesentation-b": "Präsentation B",
  "praesentation-c": "Präsentation C",
  diskussion: "Diskussion",
  bildbeschreibung: "Bildbeschreibung",
  meinung: "Meinung äußern",
};

export function getExerciseTitle(exercise: Exercise): string {
  const content = exercise.content as unknown as SpeakingExerciseContent | null;
  const partTitle = content?.part ? partTitles[content.part] : "Sprechübung";
  const snippet = content?.prompt ?? exercise.instructions;
  const truncated = snippet.length > 60 ? `${snippet.slice(0, 60)}…` : snippet;
  return `${partTitle} – ${truncated}`;
}
