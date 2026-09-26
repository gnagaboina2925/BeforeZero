export const PLAN_STEPS = ["prefs", "describe", "confirm", "choose", "teach", "revise", "card"] as const;
export type PlanStep = (typeof PLAN_STEPS)[number];

export const COMPLICATION_KINDS = ["communication", "support", "elevator"] as const;
export type ComplicationKind = (typeof COMPLICATION_KINDS)[number];

export const OBSERVATION_TOPICS = ["alerts", "support", "access"] as const;
export type ObservationTopic = (typeof OBSERVATION_TOPICS)[number];

export const MENTION_STATUSES = ["mentioned", "not-mentioned", "not-planned", "ambiguous"] as const;
export type MentionStatus = (typeof MENTION_STATUSES)[number];

export interface PlanPreferenceFlags {
  spokenGuidance: boolean;
  captions: boolean;
  plainLanguage: boolean;
  stepFree: boolean;
  supportPerson: boolean;
}

export interface PlanObservation {
  topic: ObservationTopic;
  status: MentionStatus;
  evidenceQuote: string | null;
  note: string;
}

export interface PlanDependency {
  kind: ComplicationKind;
  label: string;
  evidenceQuote: string;
}

export interface PlanInterpretation {
  summary: string;
  observations: PlanObservation[];
  dependencies: PlanDependency[];
  gaps: PlanObservation[];
  clarification: string | null;
  usedFallback: boolean;
  ambiguousKinds: ComplicationKind[];
}

export interface PlanChoice {
  id: string;
  label: string;
  fillsGap: boolean;
}

export interface ConfirmedPlan {
  reportedText: string;
  summary: string;
  observations: PlanObservation[];
  dependencies: PlanDependency[];
  gaps: PlanObservation[];
  usedExample: boolean;
}

export interface SelectedComplication {
  kind: ComplicationKind;
  source: "plan" | "example";
}

export interface RevisedPlanReview {
  revisedText: string;
  selectedChoiceIds: string[];
  remainingGaps: string[];
  preparationTasks: { text: string; sourceId: string }[];
  stillNeedsConfirming: string[];
  warning: string | null;
}
