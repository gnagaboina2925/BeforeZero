import { LESSON_SOURCES } from "../lesson/sources.ts";
import { detectCommMethods, detectOtherPlanningTasks, foldTypographicMarks } from "./detect.ts";
import { complicationCopy } from "./hazards.ts";
import type { ComplicationKind, PlanChoice, PlanHazardId, RevisedPlanReview } from "./types.ts";

const CARRY_PATTERN = /\b(carry me|carries me|pick me up|lift me)\b/i;
const INVENT_ROUTE_PATTERN = /\b(invent|make a new (path|route)|secret (path|route))\b/i;
const STILL_UNRESOLVED = /\b(still need|need to arrange|haven'?t|have not|not yet)\b/i;

export function evaluateRevisedPlan(args: {
  kind: ComplicationKind;
  originalText: string;
  revisedText: string;
  selectedChoiceIds: string[];
  hazardId?: PlanHazardId;
}): RevisedPlanReview {
  const hazardId = args.hazardId ?? "hurricane";
  const copy = complicationCopy(hazardId, args.kind);
  if (!copy) {
    return {
      revisedText: args.revisedText.trim(),
      selectedChoiceIds: [],
      selectedKind: args.kind,
      remainingGaps: ["This rehearsal does not have an authored scene for that dependency."],
      preparationTasks: [],
      sourceExcerpts: [],
      stillNeedsConfirming: ["This rehearsal does not prove preparedness.", "Follow local emergency managers for real instructions."],
      warning: null,
      otherDependencyNote: null,
      addressedSummary: "No authored scene was available.",
      otherPlanningTasks: detectOtherPlanningTasks(args.originalText),
    };
  }
  const allowed = new Set(copy.choices.map((choice) => choice.id));
  const selectedChoiceIds = args.selectedChoiceIds.filter((id) => allowed.has(id));
  const selected = copy.choices.filter((choice) => selectedChoiceIds.includes(choice.id));
  const warning = unsafeRevisionWarning(args.revisedText, selected);
  const remainingGaps = remainingGapsFor({ ...args, hazardId }, selected, warning);
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
  args: { kind: ComplicationKind; originalText: string; revisedText: string; hazardId: PlanHazardId },
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
    if (!filled && !namesSecondSupport(args.originalText, args.revisedText) && !namesLeaveAndCall(args.revisedText)) {
      gaps.push("A backup person or support-network contact is still to confirm.");
    }
  }
  if (args.kind === "elevator") {
    if (!filled && !namesAccessArrangement(args.revisedText)) {
      gaps.push("Accessible transportation or other help that does not depend on the elevator is still to confirm.");
    }
  }
  if (args.kind === "shelter-access") {
    if (!filled && !namesBeforehandAccess(args.revisedText)) {
      gaps.push("How you would reach the named shelter before severe weather is still to confirm.");
    }
  }
  if (args.kind === "alarm-perception") {
    if (!filled && !namesAccessibleAlarm(args.revisedText)) {
      gaps.push("A warning method you said you can perceive is still to confirm.");
    }
  }
  if (args.kind === "blocked-exit") {
    if (!filled && !namesSecondExitOrStay(args.revisedText)) {
      gaps.push("A second planned way out, or sourced stay-in-place steps if you cannot leave, is still to confirm.");
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
  if (namesSupportTask(text) || namesLeaveAndCall(text)) kinds.push("support");
  if (/\b(elevator|lift|accessible transport|paratransit)\b/i.test(text)) kinds.push("elevator");
  if (namesBeforehandAccess(text) || /\b(blankets and pillows|interior room|basement)\b/i.test(text)) {
    kinds.push("shelter-access");
  }
  if (namesAccessibleAlarm(text)) kinds.push("alarm-perception");
  if (namesSecondExitOrStay(text)) kinds.push("blocked-exit");
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
  if (kind === "support" && (namesSecondSupport("", revisedText) || namesLeaveAndCall(revisedText))) {
    return "A backup person or support-network contact";
  }
  if (kind === "elevator" && namesAccessArrangement(revisedText)) {
    return "An access arrangement that does not depend on the elevator";
  }
  if (kind === "shelter-access" && namesBeforehandAccess(revisedText)) {
    return "A beforehand arrangement to reach the named shelter";
  }
  if (kind === "alarm-perception" && namesAccessibleAlarm(revisedText)) {
    return "A warning method you said you can perceive";
  }
  if (kind === "blocked-exit" && namesSecondExitOrStay(revisedText)) {
    return "A sourced fire-escape action for a blocked exit";
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
  if (STILL_UNRESOLVED.test(foldTypographicMarks(revised))) return false;
  return /\b(another|other|second|network|registry|list of|more than one)\b/i.test(revised) && revised.trim() !== original.trim();
}

function namesAccessArrangement(text: string): boolean {
  return /\b(accessible transport|paratransit|neighbor|building (manager|plan)|local (transit|emergency)|registry)\b/i.test(
    text,
  );
}

function namesBeforehandAccess(text: string): boolean {
  return /\b(before (severe )?weather|arrange how|extra help|how I would (reach|get))\b/i.test(text);
}

function namesAccessibleAlarm(text: string): boolean {
  return /\b(strobe|vibrat|flashing light|interconnected|another warning|can perceive)\b/i.test(text);
}

function namesSecondExitOrStay(text: string): boolean {
  return /\b(second way|two ways|feel the door|9-1-1|911|cannot get out|signal for help)\b/i.test(text);
}

function namesLeaveAndCall(text: string): boolean {
  return /\b(leave and call|call 9-1-1|call 911)\b/i.test(text);
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
