import { Metadata } from "next";
import { notFound } from "next/navigation";
import { PartOverview } from "@/components/mündlich/part-overview";
import { getSpeakingExercisesByPart } from "@/server/actions/speaking-actions";
import { SpeakingPart } from "@/types";

export const metadata: Metadata = {
  title: "Diskussion",
  description: "C1 discussion prompts.",
};

export default async function DiskussionPage() {
  const part: SpeakingPart = "diskussion";
  const exercises = await getSpeakingExercisesByPart(part);

  if (exercises.length === 0) {
    notFound();
  }

  return <PartOverview part={part} exercises={exercises} />;
}
