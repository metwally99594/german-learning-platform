import { Metadata } from "next";
import { MuendlichHub } from "@/components/muendlich/muendlich-hub";
import { SpeakingPartSummary } from "@/types";

export const metadata: Metadata = {
  title: "C1 Mündlich",
  description: "Practise the four tasks of the German C1 speaking exam.",
};

const parts: SpeakingPartSummary[] = [
  {
    part: "praesentation-a",
    title: "Präsentation A",
    description: "Practise presentations on society, lifestyle and values.",
    estimatedMinutes: 6,
  },
  {
    part: "praesentation-b",
    title: "Präsentation B",
    description: "Practise presentations on culture, media and everyday life.",
    estimatedMinutes: 6,
  },
  {
    part: "praesentation-c",
    title: "Präsentation C",
    description: "Practise presentations on language, education and identity.",
    estimatedMinutes: 6,
  },
  {
    part: "diskussion",
    title: "Diskussion",
    description: "Discuss a statement or problem and weigh different viewpoints.",
    estimatedMinutes: 5,
  },
  {
    part: "bildbeschreibung",
    title: "Bildbeschreibung",
    description: "Describe and interpret a picture, chart or diagram.",
    estimatedMinutes: 5,
  },
  {
    part: "meinung",
    title: "Meinung äußern",
    description: "React to a short text or quote and argue your position.",
    estimatedMinutes: 5,
  },
];

export default function MuendlichPage() {
  return (
    <div className="space-y-8 px-4 py-8">
      <MuendlichHub parts={parts} />
    </div>
  );
}
