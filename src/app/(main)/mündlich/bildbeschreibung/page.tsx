import { Metadata } from "next";
import { notFound } from "next/navigation";
import { PartOverview } from "@/components/mündlich/part-overview";
import { getSpeakingExercisesByPart } from "@/server/actions/speaking-actions";
import { SpeakingPart } from "@/types";

export const metadata: Metadata = {
  title: "Bildbeschreibung",
  description: "C1 image description prompts.",
};

export default async function BildbeschreibungPage() {
  const part: SpeakingPart = "bildbeschreibung";
  const exercises = await getSpeakingExercisesByPart(part);

  if (exercises.length === 0) {
    notFound();
  }

  return <PartOverview part={part} exercises={exercises} />;
}
