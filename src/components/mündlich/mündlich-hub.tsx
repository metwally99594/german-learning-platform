import Link from "next/link";
import { SpeakingPartSummary } from "@/types";

export type MündlichHubProps = {
  parts: SpeakingPartSummary[];
};

export function MündlichHub({ parts }: MündlichHubProps) {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">C1 Mündliche Prüfung</h1>
      <p className="text-muted-foreground">Choose a part to practise.</p>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {parts.map((part) => (
          <li key={part.part}>
            <Link
              href={`/mündlich/${part.part}`}
              className="block rounded-lg border p-4 transition-colors hover:bg-accent"
            >
              <h2 className="text-lg font-semibold">{part.title}</h2>
              <p className="text-sm text-muted-foreground">{part.description}</p>
              <p className="text-xs text-muted-foreground">~{part.estimatedMinutes} min</p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
