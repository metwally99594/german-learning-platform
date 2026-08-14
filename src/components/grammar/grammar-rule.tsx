import { SpeakableText } from "@/components/speech/speakable-text";

export type GrammarRuleProps = {
  ruleDe: string;
};

export function GrammarRule({ ruleDe }: GrammarRuleProps) {
  return (
    <div className="rounded-lg border-2 border-red-300 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950/30">
      <SpeakableText text={ruleDe} className="w-full overflow-x-auto break-words font-mono text-base font-bold text-red-600 dark:text-red-400" />
    </div>
  );
}
