export type SpeechEvaluation = {
  score: number;
  cefr: string;
  wordCount: number;
  durationSeconds: number;
  wpm: number;
  fillers: { word: string; count: number }[];
  fillerScore: number;
  structureScore: number;
  vocabularyScore: number;
  grammarScore: number;
  fluencyScore: number;
  strengths: string[];
  improvements: string[];
  correctedText?: string;
};

const FILLER_WORDS = [
  "äh",
  "ähm",
  "hm",
  "also",
  "naja",
  "halt",
  "irgendwie",
  "sozusagen",
  "quasi",
  "eigentlich",
  "irgendwie",
  "weißt du",
  "ne",
];

const CONNECTORS = [
  "weil",
  "deshalb",
  "deshwegen",
  "trotzdem",
  "obwohl",
  "jedoch",
  "allerdings",
  "außerdem",
  "zudem",
  "darüber hinaus",
  "zum beispiel",
  "beispielsweise",
  "zunächst",
  "zuerst",
  "anschließend",
  "danach",
  "schließlich",
  "zusammenfassend",
  "meiner meinung nach",
  "ich bin der meinung",
];

const C1_PHRASES = [
  "meines erachtens",
  "ich bin der auffassung",
  "es lässt sich darüber streiten",
  "ein zentrales argument",
  "andererseits",
  "im gegensatz dazu",
  "vor diesem hintergrund",
  "zusammenfassend lässt sich sagen",
  "daraus ergibt sich",
  "in betracht ziehen",
  "berücksichtigt man",
  "es sei daran erinnert",
];

const SUBJUNCTIVE_MARKERS = [
  "wäre",
  "hätte",
  "könnte",
  "sollte",
  "müsste",
  "würde",
  "wenn",
  "angenommen",
];

function countOccurrences(text: string, words: string[]): number {
  const lower = text.toLowerCase();
  return words.reduce((total, word) => {
    const regex = new RegExp(`\\b${word}\\b`, "g");
    const matches = lower.match(regex);
    return total + (matches ? matches.length : 0);
  }, 0);
}

export function evaluateGermanSpeech(
  transcript: string,
  durationSeconds: number
): SpeechEvaluation {
  const cleanText = transcript.trim();
  const words = cleanText
    .split(/\s+/)
    .filter((w) => w.length > 0 && /^[a-zA-ZäöüßÄÖÜ]+$/.test(w.replace(/[^a-zA-ZäöüßÄÖÜ]/g, "")));
  const wordCount = words.length;
  const sentences = cleanText
    .split(/[.!?]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  const safeDuration = Math.max(1, durationSeconds);
  const wpm = Math.round((wordCount / safeDuration) * 60);

  // Filler analysis
  const fillerCounts = FILLER_WORDS.map((word) => ({
    word,
    count: countOccurrences(cleanText, [word]),
  })).filter((item) => item.count > 0);

  const totalFillers = fillerCounts.reduce((sum, item) => sum + item.count, 0);
  const fillerRatio = wordCount > 0 ? totalFillers / wordCount : 0;
  const fillerScore = Math.max(0, Math.round(100 - fillerRatio * 400));

  // Structure: sentences and connectors
  const connectorCount = countOccurrences(cleanText, CONNECTORS);
  const avgSentenceLength = sentences.length > 0 ? wordCount / sentences.length : 0;
  const structureScore = Math.min(
    100,
    Math.round(
      Math.min(sentences.length * 8, 40) +
        Math.min(connectorCount * 10, 35) +
        (avgSentenceLength >= 8 && avgSentenceLength <= 25 ? 25 : 15)
    )
  );

  // Vocabulary: C1 phrases, variety
  const uniqueWords = new Set(words.map((w) => w.toLowerCase()));
  const varietyRatio = wordCount > 0 ? uniqueWords.size / wordCount : 0;
  const c1Count = countOccurrences(cleanText, C1_PHRASES);
  const vocabularyScore = Math.min(
    100,
    Math.round(varietyRatio * 60 + Math.min(c1Count * 12, 40))
  );

  // Grammar: subjunctive, complex structures
  const subjunctiveCount = countOccurrences(cleanText, SUBJUNCTIVE_MARKERS);
  const grammarScore = Math.min(100, Math.round(40 + subjunctiveCount * 15 + varietyRatio * 30));

  // Fluency: speed and fillers
  const speedScore = wpm >= 100 && wpm <= 170 ? 100 : wpm < 80 ? 50 : wpm > 180 ? 70 : 80;
  const fluencyScore = Math.round((speedScore * 0.6 + fillerScore * 0.4));

  // Weighted total
  const score = Math.round(
    structureScore * 0.25 +
      vocabularyScore * 0.25 +
      grammarScore * 0.25 +
      fluencyScore * 0.25
  );

  const cefr = score >= 85 ? "C1" : score >= 70 ? "B2" : score >= 55 ? "B1" : score >= 40 ? "A2" : "A1";

  const strengths: string[] = [];
  const improvements: string[] = [];

  if (connectorCount >= 3) {
    strengths.push("You used good connectors to structure your argument.");
  } else {
    improvements.push("Add more connectors (weil, deshalb, jedoch, außerdem) to link your ideas.");
  }

  if (c1Count >= 2) {
    strengths.push("Good use of C1-level phrases.");
  } else {
    improvements.push("Try to include more advanced phrases (meines Erachtens, ein zentrales Argument ist…).");
  }

  if (subjunctiveCount >= 2) {
    strengths.push("You used Konjunktiv II forms, which is great for C1.");
  } else {
    improvements.push("Practice Konjunktiv II (wäre, hätte, könnte) for hypothetical statements.");
  }

  if (fillerRatio < 0.03) {
    strengths.push("Very few filler words — smooth delivery.");
  } else {
    improvements.push("Reduce filler words (äh, ähm, also) to sound more confident.");
  }

  if (wpm >= 100 && wpm <= 170) {
    strengths.push("Good speaking pace.");
  } else if (wpm < 80) {
    improvements.push("Try to speak a bit faster to keep the listener engaged.");
  } else if (wpm > 180) {
    improvements.push("Try to slow down slightly for clarity.");
  }

  if (wordCount < 30) {
    improvements.push("Your answer was quite short. Try to expand with examples and explanations.");
  } else if (wordCount > 120) {
    strengths.push("Good length with plenty of detail.");
  }

  return {
    score,
    cefr,
    wordCount,
    durationSeconds,
    wpm,
    fillers: fillerCounts,
    fillerScore,
    structureScore,
    vocabularyScore,
    grammarScore,
    fluencyScore,
    strengths,
    improvements,
  };
}
