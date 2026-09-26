export type HouseholdId = "alone" | "roommates" | "family";

export type StepId =
  | "lighting"
  | "contact"
  | "commBackup"
  | "supplies"
  | "openDetail";

export type Screen = "welcome" | "rehearsal" | "results";

export type ChoiceKind = "planned" | "gap";

export interface Choice {
  id: string;
  label: string;
  kind: ChoiceKind;
  preparationTask?: string;
  hint?: string;
}

export interface Question {
  id: string;
  stepId: StepId;
  title: string;
  prompt: string;
  choices: Choice[];
  eventNotice?: string;
}

export interface HouseholdOption {
  id: HouseholdId;
  label: string;
  description: string;
}

export type Answers = Partial<Record<StepId, string>>;

export const MAX_TYPED_ANSWER_LENGTH = 1000;

export interface InterpretRequestBody {
  household: HouseholdId;
  stepId: StepId;
  typedAnswer: string;
  priorAnswers?: Answers;
  clarificationExchange?: ClarificationExchange;
}

export interface ClarificationExchange {
  previousAnswer: string;
  clarificationQuestion: string;
}

export interface InterpretSuccess {
  matchedChoiceId: string | null;
  feedback: string;
  clarification: string | null;
}

export type InterpretErrorCode =
  | "invalid_request"
  | "missing_credentials"
  | "auth_failed"
  | "insufficient_credits"
  | "rate_limited"
  | "timeout"
  | "unavailable_model"
  | "invalid_schema"
  | "validation_failed"
  | "unavailable";

export interface InterpretError {
  code: InterpretErrorCode;
  message: string;
  diagnostic?: string;
}

export interface RecordedAnswer {
  stepId: StepId;
  questionTitle: string;
  questionPrompt: string;
  choice: Choice;
}

export interface RehearsalResults {
  recorded: RecordedAnswer[];
  plansIdentified: RecordedAnswer[];
  detailsToPrepare: Array<RecordedAnswer & { task: string }>;
  phoneDependent: boolean;
  backupIdentified: boolean;
  backupUnanswered: boolean;
  backupLabel: string | null;
  meetingLocationUnresolved: boolean;
  backupStatusLine: string | null;
  meetingConflictNote: string | null;
}
