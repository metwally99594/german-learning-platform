import { GrammarStory } from "@/types/grammar";
import { cn } from "@/lib/utils";

export type StoryBlockProps = {
  story: GrammarStory;
};

export function StoryBlock({ story }: StoryBlockProps) {
  return (
    <div className="space-y-4 rounded-lg border p-4">
      <div>
        <h3 dir="ltr" className="text-left text-lg font-semibold">
          {story.titleDe}
        </h3>
        <p dir="rtl" className="text-right text-sm text-muted-foreground">
          {story.titleAr}
        </p>
      </div>
      <ol className="space-y-2">
        {story.sentences.map((sentence, index) => (
          <li
            key={index}
            className={cn(
              "rounded-md p-2",
              sentence.highlight && "bg-yellow-100 dark:bg-yellow-900/30"
            )}
          >
            <p dir="ltr" className="text-left">
              {sentence.de}
            </p>
            <p dir="rtl" className="text-right text-sm text-muted-foreground">
              {sentence.ar}
            </p>
          </li>
        ))}
      </ol>
    </div>
  );
}
