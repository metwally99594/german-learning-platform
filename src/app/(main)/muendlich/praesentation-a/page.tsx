import { Metadata } from "next";
import { notFound } from "next/navigation";
import { PartOverview } from "@/components/muendlich/part-overview";
import { getSpeakingExercisesByPart } from "@/server/actions/speaking-actions";
import { SpeakingPart } from "@/types";

export const metadata: Metadata = {
  title: "Präsentation A",
  description: "C1 presentation prompts set A.",
};

export default async function PraesentationAPage() {
  const part: SpeakingPart = "präsentation-a";
  const exercises = await getSpeakingExercisesByPart(part);

  if (exercises.length === 0) {
    notFound();
  }

  return <PartOverview part={part} exercises={exercises} />;
}
