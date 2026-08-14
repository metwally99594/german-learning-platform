import { GrammarExample } from "@/types/grammar";
import { SpeakableText } from "@/components/speech/speakable-text";

export type ExampleListProps = {
  examples: GrammarExample[];
};

export function ExampleList({ examples }: ExampleListProps) {
  return (
    <ul className="space-y-3">
      {examples.map((example, index) => (
        <li key={index} className="rounded-md border p-3">
          <SpeakableText text={example.de} className="text-base" />
          <p dir="rtl" className="mt-1 text-right text-sm text-muted-foreground">
            {example.ar}
          </p>
        </li>
      ))}
    </ul>
  );
}
