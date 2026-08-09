import Link from "next/link";
import { Exercise } from "@prisma/client";
import { SpeakingPart } from "@/types";

export type PartOverviewProps = {
  part: SpeakingPart;
  exercises: Exercise[];
};

export function PartOverview({ part, exercises }: PartOverviewProps) {
  return (
    <div className="space-y-6 px-4 py-8">
      <h1 className="text-3xl font-bold capitalize">{part}</h1>
      <ul className="space-y-3">
        {exercises.map((exercise) => {
          const content = exercise.content as Record<string, unknown> | null;
          const prompt = typeof content?.prompt === "string" ? content.prompt : exercise.instructions;

          return (
            <li key={exercise.id}>
              <Link
                href={`/muendlich/${part}/${exercise.id}`}
                className="block rounded-lg border p-4 transition-colors hover:bg-accent"
              >
                <p className="font-medium">{prompt}</p>
                <p className="text-sm text-muted-foreground">{exercise.instructions}</p>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
