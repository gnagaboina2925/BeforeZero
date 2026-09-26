import { LESSON_SOURCES } from "../lesson/sources.ts";
import { COMPLICATIONS } from "./catalog.ts";
import { detectCommMethods, detectOtherPlanningTasks } from "./detect.ts";
import type { ComplicationKind, PlanChoice, RevisedPlanReview } from "./types.ts";

const CARRY_PATTERN = /\b(carry me|carries me|pick me up|lift me)\b/i;
const INVENT_ROUTE_PATTERN = /\b(invent|make a new (path|route)|secret (path|route))\b/i;
const STILL_UNRESOLVED = /\b(still need|need to arrange|haven'?t|have not|not yet)\b/i;

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
  const addressed = addressedKinds(args.revisedText);
  const otherDependencyNote = mismatchNote(args.kind, addressed);
  const otherPlanningTasks = detectOtherPlanningTasks(args.originalText);
  return {
    revisedText: args.revisedText.trim(),
    selectedChoiceIds,
    selectedKind: args.kind,
    remainingGaps,
    preparationTasks: copy.sourceIds.map((sourceId) => ({
      text: firstSentence(LESSON_SOURCES[sourceId].excerpt),
      sourceId,
    })),
    sourceExcerpts: copy.sourceIds.map((sourceId) => ({
      sourceId,
      title: LESSON_SOURCES[sourceId].title,
      excerpt: LESSON_SOURCES[sourceId].excerpt,
    })),
    stillNeedsConfirming: confirmingList(remainingGaps),
    warning,
    otherDependencyNote,
    addressedSummary: addressedSummaryFor(args.kind, args.revisedText, selected, otherDependencyNote),
    otherPlanningTasks,
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

export function addressedKinds(text: string): ComplicationKind[] {
  const kinds: ComplicationKind[] = [];
  if (namesSecondAlertChannel(text) || detectCommMethods(text).length > 0) kinds.push("communication");
  if (namesSupportTask(text)) kinds.push("support");
  if (/\b(elevator|lift|accessible transport|paratransit)\b/i.test(text)) kinds.push("elevator");
  return kinds;
}

function mismatchNote(selected: ComplicationKind, addressed: ComplicationKind[]): string | null {
  const other = addressed.filter((kind) => kind !== selected);
  if (other.length === 0) return null;
  if (selected === "communication" && other.includes("support") && !addressed.includes("communication")) {
    return "You identified a support-person task. The communication backup explored in this rehearsal is still unresolved.";
  }
  if (selected === "support" && other.includes("communication") && !addressed.includes("support")) {
    return "You identified a communication task. The support-person backup explored in this rehearsal is still unresolved.";
  }
  if (selected === "elevator" && other.length > 0 && !addressed.includes("elevator")) {
    return "You identified a different planning task. The elevator backup explored in this rehearsal is still unresolved.";
  }
  if (!addressed.includes(selected) && other.length > 0) {
    return "You identified a different planning task. The backup explored in this rehearsal is still unresolved.";
  }
  return null;
}

function addressedSummaryFor(
  kind: ComplicationKind,
  revisedText: string,
  selected: PlanChoice[],
  otherDependencyNote: string | null,
): string {
  if (otherDependencyNote && /support-person task/i.test(otherDependencyNote)) {
    return "A support-person task";
  }
  if (otherDependencyNote && /communication task/i.test(otherDependencyNote)) {
    return "A communication task";
  }
  if (selected.some((choice) => choice.fillsGap)) {
    return selected.find((choice) => choice.fillsGap)?.label ?? "A listed backup option";
  }
  if (kind === "communication" && namesSecondAlertChannel(revisedText)) {
    return "A second official way to receive alerts";
  }
  if (kind === "support" && namesSecondSupport("", revisedText)) {
    return "A backup person or support-network contact";
  }
  if (kind === "elevator" && namesAccessArrangement(revisedText)) {
    return "An access arrangement that does not depend on the elevator";
  }
  if (!revisedText.trim() && selected.length === 0) return "No revised response was recorded yet.";
  return "The words in your revised response";
}

function namesSecondAlertChannel(text: string): boolean {
  return /\b(noaa|weather radio|wea|wireless|eas|emergency alert system|community alert|fema app|tv|television)\b/i.test(
    text,
  );
}

function namesSupportTask(text: string): boolean {
  return /\b(support person|support network|neighbor|backup person|another person|caregiver)\b/i.test(text);
}

function namesSecondSupport(original: string, revised: string): boolean {
  if (STILL_UNRESOLVED.test(revised)) return false;
  return /\b(another|other|second|network|registry|list of|more than one)\b/i.test(revised) && revised.trim() !== original.trim();
}

function namesAccessArrangement(text: string): boolean {
  return /\b(accessible transport|paratransit|neighbor|building (manager|plan)|local (transit|emergency)|registry)\b/i.test(
    text,
  );
}

function confirmingList(remainingGaps: string[]): string[] {
  return [
    ...remainingGaps,
    "This rehearsal does not prove preparedness.",
    "Follow local emergency managers for real instructions.",
  ];
}

function firstSentence(excerpt: string): string {
  const match = excerpt.match(/^.+?[.](?=\s|$)/);
  return (match?.[0] ?? excerpt).trim();
}
