import { RubricItem } from "@/types";

export type SelfAssessmentProps = {
  rubric: RubricItem[];
  onRate?: (ratings: Record<string, number>) => void;
};

export function SelfAssessment({ rubric, onRate }: SelfAssessmentProps) {
  return (
    <div className="space-y-4 rounded-lg border p-4">
      <h3 className="font-semibold">Self-assessment</h3>
      <ul className="space-y-2">
        {rubric.map((item, i) => (
          <li key={i} className="text-sm">
            {item.criterion}: {item.description}
          </li>
        ))}
      </ul>
      {onRate && <button onClick={() => onRate({})}>Submit ratings</button>}
    </div>
  );
}
