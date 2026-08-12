export type GrammarRuleProps = {
  ruleDe: string;
};

export function GrammarRule({ ruleDe }: GrammarRuleProps) {
  return (
    <div className="rounded-lg border-2 border-red-300 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950/30">
      <pre
        dir="ltr"
        className="overflow-x-auto whitespace-pre-wrap break-words text-left font-mono text-base font-bold text-red-600 dark:text-red-400"
      >
        {ruleDe}
      </pre>
    </div>
  );
}
