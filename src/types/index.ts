export type NavItem = {
  title: string;
  href: string;
  icon?: string;
};

export type Locale = "en" | "ar";

export type DashboardStat = {
  label: string;
  value: string;
  description: string;
  trend?: string;
};

export type SpeakingPart = "präsentation" | "diskussion" | "bildbeschreibung" | "meinung";

export type RubricItem = {
  criterion: string;
  description: string;
  maxPoints: number;
};

export type SpeakingExerciseContent = {
  part: SpeakingPart;
  prompt: string;
  stimulus?: string;
  instructions: string;
  prepTimeSeconds: number;
  responseTimeSeconds: number;
  modelAnswer: string;
  usefulPhrases: string[];
  hints?: string[];
};

export type SpeakingPartSummary = {
  part: SpeakingPart;
  title: string;
  description: string;
  estimatedMinutes: number;
};
