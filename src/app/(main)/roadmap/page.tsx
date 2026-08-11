import { Metadata } from "next";
import { getRoadmap } from "@/server/actions/grammar-actions";
import { RoadmapTree } from "@/components/grammar/roadmap-tree";

export const metadata: Metadata = {
  title: "خريطة المسار",
  description: "تتبع تقدمك في قواعد الألماني من A1 لـ C1.",
};

export default async function RoadmapPage() {
  const levels = await getRoadmap();

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-8">
      <div dir="rtl" className="text-right">
        <h1 className="text-3xl font-bold">خريطة المسار</h1>
        <p className="text-muted-foreground">من A1 لـ C1 — خطوة بخطوة.</p>
      </div>
      <RoadmapTree levels={levels} />
    </div>
  );
}
