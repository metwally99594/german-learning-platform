export type SessionSummaryProps = {
  points: number;
  badges: string[];
  duration: number;
  nextHref?: string;
};

export function SessionSummary({ points, badges, duration, nextHref }: SessionSummaryProps) {
  return (
    <div className="space-y-4 rounded-lg border p-4">
      <h2 className="text-xl font-bold">Session summary</h2>
      <p>Points: {points}</p>
      <p>Duration: {duration}s</p>
      <ul>
        {badges.map((badge) => (
          <li key={badge}>{badge}</li>
        ))}
      </ul>
      {nextHref && <a href={nextHref}>Next prompt</a>}
    </div>
  );
}
