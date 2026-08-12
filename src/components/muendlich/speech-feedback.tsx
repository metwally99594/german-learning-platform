"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { SpeechEvaluation } from "./evaluate-speech";

export type SpeechFeedbackProps = {
  evaluation: SpeechEvaluation;
  transcript: string;
};

export function SpeechFeedback({ evaluation, transcript }: SpeechFeedbackProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Overall score: {evaluation.score}/100</CardTitle>
          <CardDescription>
            Estimated level: {evaluation.cefr} · {evaluation.wordCount} words ·{" "}
            {evaluation.durationSeconds}s · {evaluation.wpm} WPM
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ScoreBar label="Overall" value={evaluation.score} />

          <div className="grid gap-3 sm:grid-cols-2">
            <ScoreBar label="Structure" value={evaluation.structureScore} />
            <ScoreBar label="Vocabulary" value={evaluation.vocabularyScore} />
            <ScoreBar label="Grammar" value={evaluation.grammarScore} />
            <ScoreBar label="Fluency" value={evaluation.fluencyScore} />
          </div>
        </CardContent>
      </Card>

      {evaluation.fillers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Filler words</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="flex flex-wrap gap-2">
              {evaluation.fillers.map((filler) => (
                <li
                  key={filler.word}
                  className="rounded-full bg-muted px-3 py-1 text-sm"
                >
                  {filler.word}: {filler.count}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Transcript</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-wrap text-sm leading-relaxed">{transcript || "No speech detected."}</p>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Strengths</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc space-y-1 pl-4 text-sm">
              {evaluation.strengths.length > 0 ? (
                evaluation.strengths.map((item, i) => <li key={i}>{item}</li>)
              ) : (
                <li>Keep practising — every attempt builds fluency.</li>
              )}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Improvements</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc space-y-1 pl-4 text-sm">
              {evaluation.improvements.length > 0 ? (
                evaluation.improvements.map((item, i) => <li key={i}>{item}</li>)
              ) : (
                <li>Great job — try another prompt to keep improving.</li>
              )}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ScoreBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span>{label}</span>
        <span className="tabular-nums">{value}</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full bg-primary transition-all"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}
