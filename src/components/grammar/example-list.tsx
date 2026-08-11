import { GrammarExample } from "@/types/grammar";

export type ExampleListProps = {
  examples: GrammarExample[];
};

export function ExampleList({ examples }: ExampleListProps) {
  return (
    <ul className="space-y-3">
      {examples.map((example, index) => (
        <li key={index} className="rounded-md border p-3">
          <p dir="ltr" className="text-left text-base">
            {example.de}
          </p>
          <p dir="rtl" className="mt-1 text-right text-sm text-muted-foreground">
            {example.ar}
          </p>
        </li>
      ))}
    </ul>
  );
}
