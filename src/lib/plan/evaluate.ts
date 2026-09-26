import { LESSON_SOURCES, type LessonSourceId } from "../lesson/sources.ts";
import { COMPLICATIONS } from "./catalog.ts";
import type { ComplicationKind, PlanChoice, RevisedPlanReview } from "./types.ts";

const CARRY_PATTERN = /\b(carry me|carries me|pick me up|lift me)\b/i;
const INVENT_ROUTE_PATTERN = /\b(invent|make a new (path|route)|secret (path|route))\b/i;

export function evaluateRevisedPlan(args: {
  kind: ComplicationKind;
  originalText: string;
  revisedText: string;
  selectedChoiceIds: string[];
}): RevisedPlanReview {
  const copy = COMPLICATIONS[args.kind];
  const allowed = new Set(copy.choices.map((choice) => choice.id));
  const selectedChoiceIds = args.selectedChoiceIds.filter((id) => allowed.has(id));
  const selected = copy.choices.filter((choice) => selectedChoiceIds.includes(choice.id));
  const warning = unsafeRevisionWarning(args.revisedText, selected);
  const remainingGaps = remainingGapsFor(args, selected, warning);
  const preparationTasks = copy.sourceIds.map((sourceId) => ({
    text: taskForSource(sourceId),
    sourceId,
  }));
  return {
    revisedText: args.revisedText.trim(),
    selectedChoiceIds,
    remainingGaps,
    preparationTasks,
    stillNeedsConfirming: confirmingList(args.kind, remainingGaps),
    warning,
  };
}

function unsafeRevisionWarning(revisedText: string, selected: PlanChoice[]): string | null {
  if (selected.some((choice) => choice.id === "carry-or-invent") || CARRY_PATTERN.test(revisedText) || INVENT_ROUTE_PATTERN.test(revisedText)) {
    return "That revised answer is not used as a recommended action. This rehearsal does not invent a route or recommend carrying someone.";
  }
  return null;
}

function remainingGapsFor(
  args: { kind: ComplicationKind; originalText: string; revisedText: string },
  selected: PlanChoice[],
  warning: string | null,
): string[] {
  const gaps: string[] = [];
  if (warning) {
    gaps.push("A carrying plan or invented route is not a sourced action for this rehearsal.");
  }
  const filled = selected.some((choice) => choice.fillsGap) && !warning;
  if (args.kind === "communication") {
    if (!filled && !namesSecondAlertChannel(args.revisedText)) {
      gaps.push("A second official way to receive alerts is still to confirm.");
    }
  }
  if (args.kind === "support") {
    if (!filled && !namesSecondSupport(args.originalText, args.revisedText)) {
      gaps.push("A backup person or support-network contact is still to confirm.");
    }
  }
  if (args.kind === "elevator") {
    if (!filled && !namesAccessArrangement(args.revisedText)) {
      gaps.push("Accessible transportation or other help that does not depend on the elevator is still to confirm.");
    }
  }
  if (!args.revisedText.trim() && selected.length === 0) {
    gaps.push("No revised response was recorded yet.");
  }
  return [...new Set(gaps)];
}

function namesSecondAlertChannel(text: string): boolean {
  return /\b(noaa|weather radio|wea|wireless|eas|emergency alert system|community alert|fema app|tv|television)\b/i.test(
    text,
  );
}

function namesSecondSupport(original: string, revised: string): boolean {
  return /\b(another|other|second|network|registry|list of|more than one)\b/i.test(revised) && revised.trim() !== original.trim();
}

function namesAccessArrangement(text: string): boolean {
  return /\b(accessible transport|paratransit|neighbor|building (manager|plan)|local (transit|emergency)|registry)\b/i.test(
    text,
  );
}

function confirmingList(_kind: ComplicationKind, remainingGaps: string[]): string[] {
  return [
    ...remainingGaps,
    "This rehearsal does not prove preparedness.",
    "Follow local emergency managers for real instructions.",
  ];
}

function taskForSource(sourceId: LessonSourceId): string {
  return LESSON_SOURCES[sourceId].excerpt;
}
