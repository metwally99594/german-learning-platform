import { ChartData } from "@/types";
import { StatChart } from "./stat-chart";

export type PromptCardProps = {
  title: string;
  stimulus?: string;
  chart?: ChartData;
  prompt: string;
  instructions: string;
};

export function PromptCard({ title, stimulus, chart, prompt, instructions }: PromptCardProps) {
  return (
    <div className="space-y-4 rounded-lg border p-4">
      <h1 className="text-xl font-semibold">{title}</h1>
      {stimulus && <p className="text-sm text-muted-foreground">{stimulus}</p>}
      {chart && <StatChart chart={chart} />}
      <p className="text-base">{prompt}</p>
      <p className="text-sm text-muted-foreground">{instructions}</p>
    </div>
  );
}
