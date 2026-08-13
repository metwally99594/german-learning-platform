"use server";

import OpenAI from "openai";
import { SpeechEvaluation } from "@/components/muendlich/evaluate-speech";

const NVIDIA_BASE_URL = process.env.NVIDIA_BASE_URL ?? "https://integrate.api.nvidia.com/v1";
const NVIDIA_API_KEY = process.env.NVIDIA_API_KEY;
const NVIDIA_MODEL = process.env.NVIDIA_MODEL ?? "meta/muse-glimmer-30b";

export type NvidiaFeedbackInput = {
  transcript: string;
  durationSeconds: number;
  prompt: string;
};

export async function getNvidiaSpeakingFeedback(
  input: NvidiaFeedbackInput
): Promise<{ evaluation?: SpeechEvaluation; error?: string } | undefined> {
  if (!NVIDIA_API_KEY) {
    return { error: "NVIDIA_API_KEY is not configured." };
  }

  const openai = new OpenAI({
    baseURL: NVIDIA_BASE_URL,
    apiKey: NVIDIA_API_KEY,
  });

  const systemPrompt = `You are a C1 German oral-exam evaluator. Analyze the spoken German transcript and return STRICT JSON only. Use German level C1 criteria: structure, vocabulary, grammar (including Konjunktiv II and connectors), and fluency.

Return this exact JSON shape:
{
  "score": number 0-100,
  "cefr": "A1|A2|B1|B2|C1",
  "wordCount": number,
  "wpm": number,
  "fillerScore": number 0-100,
  "structureScore": number 0-100,
  "vocabularyScore": number 0-100,
  "grammarScore": number 0-100,
  "fluencyScore": number 0-100,
  "strengths": ["string", ...],
  "improvements": ["string", ...],
  "fillers": [{"word": "string", "count": number}, ...],
  "correctedText": "string or null"
}

Rules:
- score is an integer.
- Provide 2-4 strengths and 2-4 improvements in Arabic.
- correctedText is an improved German version of what the user said, or null if already good.
- Be strict but encouraging; focus on C1 exam expectations.`;

  const userPrompt = `Prompt: ${input.prompt}\n\nTranscript (${input.durationSeconds}s):\n${input.transcript}`;

  try {
    const completion = await openai.chat.completions.create({
      model: NVIDIA_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
      top_p: 0.95,
      max_tokens: 4096,
      stream: false,
    });

    const raw = completion.choices[0]?.message?.content?.trim() ?? "";
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    const jsonString = jsonMatch ? jsonMatch[0] : raw;
    const parsed = JSON.parse(jsonString) as Partial<SpeechEvaluation>;

    const evaluation: SpeechEvaluation = {
      score: clampNumber(parsed.score, 0, 100),
      cefr: parsed.cefr ?? "A1",
      wordCount: parsed.wordCount ?? input.transcript.split(/\s+/).length,
      durationSeconds: input.durationSeconds,
      wpm: parsed.wpm ?? Math.round((parsed.wordCount ?? 0) / Math.max(1, input.durationSeconds) * 60),
      fillerScore: clampNumber(parsed.fillerScore, 0, 100),
      structureScore: clampNumber(parsed.structureScore, 0, 100),
      vocabularyScore: clampNumber(parsed.vocabularyScore, 0, 100),
      grammarScore: clampNumber(parsed.grammarScore, 0, 100),
      fluencyScore: clampNumber(parsed.fluencyScore, 0, 100),
      strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [],
      improvements: Array.isArray(parsed.improvements) ? parsed.improvements : [],
      fillers: Array.isArray(parsed.fillers) ? parsed.fillers : [],
      correctedText: typeof parsed.correctedText === "string" ? parsed.correctedText : undefined,
    };

    return { evaluation };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { error: `NVIDIA feedback failed: ${message}` };
  }
}

function clampNumber(value: unknown, min: number, max: number): number {
  if (typeof value !== "number" || Number.isNaN(value)) return 0;
  return Math.max(min, Math.min(max, Math.round(value)));
}
