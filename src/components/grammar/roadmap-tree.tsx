import Link from "next/link";
import { CheckCircle2, Lock, Circle } from "lucide-react";
import { RoadmapLevelView } from "@/server/actions/grammar-actions";
import { cn } from "@/lib/utils";

export type RoadmapTreeProps = {
  levels: RoadmapLevelView[];
};

export function RoadmapTree({ levels }: RoadmapTreeProps) {
  return (
    <ol className="space-y-4">
      {levels.map((level) => {
        const Icon = level.state === "completed" ? CheckCircle2 : level.state === "locked" ? Lock : Circle;
        const clickable = level.state !== "locked" && level.totalLessons > 0;

        const content = (
          <div
            className={cn(
              "flex items-center gap-4 rounded-lg border p-4 transition-colors",
              level.state === "locked" && "opacity-50",
              level.state === "available" && "border-primary",
              clickable && "hover:bg-accent/50"
            )}
          >
            <Icon
              className={cn(
                "h-6 w-6 shrink-0",
                level.state === "completed" && "text-green-600 dark:text-green-500"
              )}
            />
            <div className="flex-1">
              <p className="font-medium">{level.name}</p>
              <p className="text-sm text-muted-foreground">
                {level.totalLessons > 0
                  ? `${level.completedLessons} / ${level.totalLessons} دروس مكتملة`
                  : "لسه مفيش محتوى"}
              </p>
            </div>
          </div>
        );

        return (
          <li key={level.code}>
            {clickable ? <Link href={`/grammar/${level.code.toLowerCase()}`}>{content}</Link> : content}
          </li>
        );
      })}
    </ol>
  );
}
