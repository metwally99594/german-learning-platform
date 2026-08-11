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

export type SpeakingPart =
  | "praesentation-a"
  | "praesentation-b"
  | "praesentation-c"
  | "diskussion"
  | "bildbeschreibung"
  | "meinung";

export type RubricItem = {
  criterion: string;
  description: string;
  maxPoints: number;
};

export type ChartPoint = {
  label: string;
  value: number;
};

export type ChartData = {
  type: "line" | "bar";
  unit?: string;
  points: ChartPoint[];
};

export type SpeakingExerciseContent = {
  part: SpeakingPart;
  prompt: string;
  stimulus?: string;
  chart?: ChartData;
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
