export type PromptCardProps = {
  title: string;
  stimulus?: string;
  prompt: string;
  instructions: string;
};

export function PromptCard({ title, stimulus, prompt, instructions }: PromptCardProps) {
  return (
    <div className="space-y-4 rounded-lg border p-4">
      <h2 className="text-xl font-semibold">{title}</h2>
      {stimulus && <p className="text-sm text-muted-foreground">{stimulus}</p>}
      <p className="text-base">{prompt}</p>
      <p className="text-sm text-muted-foreground">{instructions}</p>
    </div>
  );
}
