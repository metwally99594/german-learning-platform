import { RubricItem } from "@/types";

export type ModelAnswerPanelProps = {
  modelAnswer: string;
  phrases: string[];
  rubric: RubricItem[];
};

export function ModelAnswerPanel({ modelAnswer, phrases, rubric }: ModelAnswerPanelProps) {
  return (
    <div className="space-y-4 rounded-lg border p-4">
      <section>
        <h3 className="font-semibold">Model answer</h3>
        <p className="text-sm">{modelAnswer}</p>
      </section>
      <section>
        <h3 className="font-semibold">Redemittel</h3>
        <ul className="list-disc pl-5 text-sm">
          {phrases.map((phrase, i) => (
            <li key={i}>{phrase}</li>
          ))}
        </ul>
      </section>
      <section>
        <h3 className="font-semibold">Rubric</h3>
        <ul className="space-y-2 text-sm">
          {rubric.map((item, i) => (
            <li key={i}>
              {item.criterion}: {item.description} ({item.maxPoints})
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
