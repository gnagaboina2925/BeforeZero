export const PLAN_STEPS = ["prefs", "describe", "confirm", "choose", "teach", "revise", "gap-notice", "card"] as const;
export type PlanStep = (typeof PLAN_STEPS)[number];

export const PLAN_HAZARD_IDS = ["hurricane", "tornado", "home-fire"] as const;
export type PlanHazardId = (typeof PLAN_HAZARD_IDS)[number];

export const COMPLICATION_KINDS = [
  "communication",
  "support",
  "elevator",
  "shelter-access",
  "alarm-perception",
  "blocked-exit",
] as const;
export type ComplicationKind = (typeof COMPLICATION_KINDS)[number];

export const OBSERVATION_TOPICS = ["alerts", "support", "access", "alarm", "exit"] as const;
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

export interface OtherPlanningTask {
  kind: ComplicationKind;
  text: string;
}

export interface RevisedPlanReview {
  revisedText: string;
  selectedChoiceIds: string[];
  selectedKind: ComplicationKind;
  remainingGaps: string[];
  preparationTasks: { text: string; sourceId: string }[];
  sourceExcerpts: { sourceId: string; title: string; excerpt: string }[];
  stillNeedsConfirming: string[];
  warning: string | null;
  otherDependencyNote: string | null;
  addressedSummary: string;
  otherPlanningTasks: OtherPlanningTask[];
}
