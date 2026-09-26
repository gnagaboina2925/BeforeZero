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

export const PLANS_REPORTED_HEADING = "Plans and resources you reported";
export const MEETING_CONFLICT_STATUS =
  "Backup approach selected; meeting location still unresolved";
export const MEETING_CONFLICT_NOTE =
  "You selected a meeting place as a backup, but also marked that location as unresolved. Ready.gov suggests agreeing on a familiar, easy-to-find place in advance. Use it only if conditions allow and officials have not directed otherwise.";

export interface BackupRetryComparison {
  firstLabel: string;
  revisedLabel: string;
  firstIdentified: boolean;
  revisedIdentified: boolean;
  unchanged: boolean;
  summary: string;
  gapFullyResolved: boolean;
}

const MEETING_BACKUP_ID = "meeting-place";
const MEETING_LOCATION_GAP_ID = "meeting-if-separated";

export function isMeetingLocationConflict(answers: Answers): boolean {
  return answers.commBackup === MEETING_BACKUP_ID && answers.openDetail === MEETING_LOCATION_GAP_ID;
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

  const detailsToPrepare = recorded
    .filter((item) => Boolean(item.choice.preparationTask) || item.choice.kind === "gap")
    .map((item) => ({
      ...item,
      task: item.choice.preparationTask ?? defaultPreparationTask(household),
    }));

  const backup = backupChoice(household, answers);
  const meetingLocationUnresolved = isMeetingLocationConflict(answers);
  const backupApproachSelected = backup?.identified === true;
  const backupIdentified = backupApproachSelected && !meetingLocationUnresolved;
  const backupUnanswered = Boolean(answers.contact) && !backupApproachSelected;
  const plansIdentified = recorded.filter((item) => {
    if (item.choice.kind !== "planned") return false;
    if (meetingLocationUnresolved && item.stepId === "commBackup" && item.choice.id === MEETING_BACKUP_ID) {
      return false;
    }
    return true;
  });

  let backupStatusLine: string | null = null;
  let meetingConflictNote: string | null = null;
  if (meetingLocationUnresolved && backup?.label) {
    backupStatusLine = MEETING_CONFLICT_STATUS;
    meetingConflictNote = MEETING_CONFLICT_NOTE;
  } else if (backupIdentified && backup?.label) {
    backupStatusLine = `Backup identified in practice: ${backup.label}`;
  } else if (backupUnanswered) {
    backupStatusLine = "This backup is unanswered in practice.";
  } else if (!answers.contact) {
    backupStatusLine = "No communication backup step was recorded.";
  }

  return {
    recorded,
    plansIdentified,
    detailsToPrepare,
    phoneDependent: isPhoneDependentComplication(answers),
    backupIdentified,
    backupUnanswered,
    backupLabel: backup?.label ?? null,
    meetingLocationUnresolved,
    backupStatusLine,
    meetingConflictNote,
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
  const revisedApproachSelected = revised?.identified === true;
  const revisedConflict = isMeetingLocationConflict(revisedAttempt);
  const revisedIdentified = revisedApproachSelected && !revisedConflict;
  const unchanged = firstAttempt.commBackup === revisedAttempt.commBackup;
  const gapFullyResolved = revisedIdentified;

  let summary: string;
  if (revisedConflict && revisedApproachSelected) {
    summary = MEETING_CONFLICT_STATUS;
  } else if (unchanged && !revisedIdentified) {
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
    gapFullyResolved,
  };
}
