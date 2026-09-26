import {
  getQuestion,
  isPhoneDependentComplication,
  STEP_ORDER,
} from "./scenario.ts";
import type {
  Answers,
  HouseholdId,
  RecordedAnswer,
  RehearsalResults,
} from "./types.ts";

function defaultPreparationTask(household: HouseholdId): string {
  return household === "alone"
    ? "Decide this detail and write it down."
    : "Decide this detail with your household and write it down.";
}

export interface BackupRetryComparison {
  firstLabel: string;
  revisedLabel: string;
  firstIdentified: boolean;
  revisedIdentified: boolean;
  unchanged: boolean;
  summary: string;
}

function backupChoice(
  household: HouseholdId,
  answers: Answers,
): { label: string; identified: boolean } | null {
  const choiceId = answers.commBackup;
  if (!choiceId) return null;
  const question = getQuestion("commBackup", household, answers);
  const choice = question.choices.find((item) => item.id === choiceId);
  if (!choice) return null;
  return {
    label: choice.label,
    identified: choice.kind === "planned",
  };
}

export function evaluateRehearsal(
  household: HouseholdId,
  answers: Answers,
): RehearsalResults {
  const recorded: RecordedAnswer[] = [];

  for (const stepId of STEP_ORDER) {
    const choiceId = answers[stepId];
    if (!choiceId) continue;

    const question = getQuestion(stepId, household, answers);
    const choice = question.choices.find((item) => item.id === choiceId);
    if (!choice) continue;

    recorded.push({
      stepId,
      questionTitle: question.title,
      questionPrompt: question.prompt,
      choice,
    });
  }

  const plansIdentified = recorded.filter((item) => item.choice.kind === "planned");
  const detailsToPrepare = recorded
    .filter((item) => item.choice.kind === "gap")
    .map((item) => ({
      ...item,
      task: item.choice.preparationTask ?? defaultPreparationTask(household),
    }));

  const backup = backupChoice(household, answers);
  const backupIdentified = backup?.identified === true;
  const backupUnanswered = Boolean(answers.contact) && !backupIdentified;

  return {
    recorded,
    plansIdentified,
    detailsToPrepare,
    phoneDependent: isPhoneDependentComplication(answers),
    backupIdentified,
    backupUnanswered,
    backupLabel: backup?.label ?? null,
  };
}

export function compareBackupRetry(
  household: HouseholdId,
  firstAttempt: Answers,
  revisedAttempt: Answers,
): BackupRetryComparison {
  const first = backupChoice(household, firstAttempt);
  const revised = backupChoice(household, revisedAttempt);
  const firstLabel = first?.label ?? "No backup was selected.";
  const revisedLabel = revised?.label ?? "No backup was selected.";
  const firstIdentified = first?.identified === true;
  const revisedIdentified = revised?.identified === true;
  const unchanged = firstAttempt.commBackup === revisedAttempt.commBackup;

  let summary: string;
  if (unchanged && !revisedIdentified) {
    summary =
      "Your backup answer is unchanged, and this backup is still unanswered in practice.";
  } else if (unchanged) {
    summary = "Your backup answer is unchanged.";
  } else if (revisedIdentified) {
    summary = "Backup identified in practice.";
  } else {
    summary = "This backup is still unanswered in practice.";
  }

  return {
    firstLabel,
    revisedLabel,
    firstIdentified,
    revisedIdentified,
    unchanged,
    summary,
  };
}
