import { Metadata } from "next";
import { notFound } from "next/navigation";
import { PartOverview } from "@/components/mündlich/part-overview";
import { getSpeakingExercisesByPart } from "@/server/actions/speaking-actions";
import { SpeakingPart } from "@/types";

export const metadata: Metadata = {
  title: "Präsentation",
  description: "C1 presentation prompts.",
};

export default async function PräsentationPage() {
  const part: SpeakingPart = "präsentation";
  const exercises = await getSpeakingExercisesByPart(part);

  if (exercises.length === 0) {
    notFound();
  }

  return <PartOverview part={part} exercises={exercises} />;
}
