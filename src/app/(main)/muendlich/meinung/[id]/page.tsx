import { Metadata } from "next";
import { notFound } from "next/navigation";
import { SpeakingSession } from "@/components/muendlich/speaking-session";
import { getSpeakingExerciseById } from "@/server/actions/speaking-actions";
import { getExerciseTitle } from "@/lib/muendlich/format";

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const exercise = await getSpeakingExerciseById(id);
  return {
    title: exercise ? getExerciseTitle(exercise) : "Übung nicht gefunden",
  };
}

export default async function MeinungDetailPage({ params }: PageProps) {
  const { id } = await params;
  const exercise = await getSpeakingExerciseById(id);

  if (!exercise) {
    notFound();
  }

  return <SpeakingSession exercise={exercise} />;
}
