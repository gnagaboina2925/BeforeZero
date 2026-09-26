import { getHazardConfig } from "./hazards.ts";
import type { ComplicationKind, PlanDependency, PlanHazardId } from "./types.ts";

interface MethodPattern {
  id: string;
  terms: string[];
}

const COMMUNICATION_METHODS: MethodPattern[] = [
  { id: "phone", terms: ["phone", "cell", "mobile"] },
  { id: "text alerts", terms: ["text"] },
  { id: "Wireless Emergency Alerts", terms: ["wireless emergency", "wea"] },
  { id: "radio", terms: ["weather radio", "battery radio", "noaa", "radio"] },
  { id: "television", terms: ["television", "tv"] },
  { id: "FEMA app", terms: ["fema app"] },
  { id: "community alerts", terms: ["community alert"] },
  { id: "Emergency Alert System", terms: ["emergency alert system", "eas"] },
];

const SUPPORT_TERMS = [
  "neighbor",
  "friend",
  "sister",
  "brother",
  "mother",
  "father",
  "mom",
  "dad",
  "family",
  "caregiver",
  "roommate",
  "partner",
  "cousin",
  "support person",
  "support network",
];

const SHELTER_TERMS = ["safe room", "storm cellar", "interior room", "basement", "lowest floor"];
const EXIT_TERMS = ["front door", "back door", "side door", "bedroom door", "hallway door", "window", "exit", "way out"];
const ALARM_TERMS = ["smoke alarm", "fire alarm", "strobe", "alarm"];
const ELEVATOR_TERMS = ["elevator", "lift"];
const ACCESS_UNRESOLVED =
  /\b(cannot get to|can't get to|can not get to|cannot reach|can't reach|haven'?t arranged how|have not arranged how|has not arranged how|hasn't arranged how|not sure how I would get|cannot use (the )?stairs|can't use (the )?stairs|haven'?t planned how to (reach|get)|have not planned how to (reach|get)|no way to get to|cannot access|can't access|have not arranged access|unresolved access)\b/i;
const PERCEPTION_LIMIT =
  /\b(may not hear|might not hear|cannot hear|can't hear|do not hear|don't hear|will not hear|won't hear|may not see|might not see|cannot see|can't see|do not see|don't see|may not notice|might not notice|cannot notice|can't notice|may not perceive|might not perceive|cannot perceive|can't perceive|hard of hearing|deaf|visually impaired|may miss|might miss)\b/i;


const HEDGE_PATTERN = /\b(might|maybe|not sure|unsure|possibly|i think|or something|kind of)\b/i;
const SUPPORT_FAILURE_AFTER =
  /\b(cannot|can't|can not|could not|couldn't|won't|will not|does not|doesn't|do not|don't|unable to|isn't able to|is not able to)\s+(help|assist|come|be there|make it|be available)\b/i;
const PREFIX_NEGATION =
  /\b(do not|don't|does not|doesn't|did not|didn't|haven'?t|have not|cannot|can't|can not|will not|won't|never|no longer|without|not)\b/i;

export function normalizePlanText(text: string): string {
  return text.toLowerCase().replace(/\s+/g, " ").trim();
}

export function quoteAppearsInPlan(quote: string, utterance: string): boolean {
  const needle = normalizePlanText(quote);
  if (needle.length < 3) return false;
  return normalizePlanText(utterance).includes(needle);
}

export function looksUnplanned(text: string): boolean {
  return /\b(don'?t have|do not have|haven'?t|have not|no backup|not planned|never set up|no one to|without a|cannot help|can't help|unable to help)\b/i.test(
    text,
  );
}

export function isElevatorUseExclusion(text: string): boolean {
  return /\b(do not|don't|does not|doesn't|did not|didn't|never|no longer)\s+use\s+(an?\s+)?(elevator|lift)\b/i.test(
    text,
  );
}

export function detectCommMethods(utterance: string): string[] {
  const methods: string[] = [];
  for (const method of COMMUNICATION_METHODS) {
    const match = firstPositiveMatch(utterance, method.terms, "communication");
    if (match) methods.push(method.id);
  }
  return methods;
}

export function utteranceSupportsKind(
  kind: ComplicationKind,
  utterance: string,
  hazardId: PlanHazardId = "hurricane",
): boolean {
  return detectDependenciesFromText(utterance, hazardId).some((item) => item.kind === kind);
}

export function detectDependenciesFromText(
  utterance: string,
  hazardId: PlanHazardId = "hurricane",
): PlanDependency[] {
  const found: PlanDependency[] = [];
  const commMethods = detectCommMethods(utterance);
  if (commMethods.length > 0) {
    const evidenceQuote = firstPositiveMatch(
      utterance,
      COMMUNICATION_METHODS.flatMap((method) => method.terms),
      "communication",
    );
    if (evidenceQuote) {
      found.push({
        kind: "communication",
        label:
          commMethods.length > 1
            ? `Named more than one communication method (${commMethods.join("; ")})`
            : `Named communication method (${commMethods[0]})`,
        evidenceQuote,
      });
    }
  }
  const supportQuote = firstPositiveMatch(utterance, SUPPORT_TERMS, "support");
  if (supportQuote) {
    found.push({
      kind: "support",
      label: `Named support contact (${clipLabel(supportQuote)})`,
      evidenceQuote: supportQuote,
    });
  }
  const elevatorQuote = firstPositiveMatch(utterance, ELEVATOR_TERMS, "elevator");
  if (elevatorQuote) {
    found.push({
      kind: "elevator",
      label: `Mentioned elevator (${clipLabel(elevatorQuote)})`,
      evidenceQuote: elevatorQuote,
    });
  }
  const shelter = detectShelterAccess(utterance);
  if (shelter) found.push(shelter);
  const alarm = detectAlarmPerception(utterance);
  if (alarm) found.push(alarm);
  const exit = firstPositiveMatch(utterance, EXIT_TERMS, "blocked-exit");
  if (exit) {
    found.push({
      kind: "blocked-exit",
      label: `Named planned exit (${clipLabel(exit)})`,
      evidenceQuote: exit,
    });
  }
  const allowed = new Set(getHazardConfig(hazardId).kinds);
  return found.filter((item) => allowed.has(item.kind));
}

export function detectNotPlanned(utterance: string): PlanDependency[] {
  const notes: PlanDependency[] = [];
  const commNeg = firstNegatedMatch(utterance, COMMUNICATION_METHODS.flatMap((method) => method.terms), "communication");
  if (commNeg) {
    notes.push({
      kind: "communication",
      label: "Communication method described as not used or not planned",
      evidenceQuote: commNeg,
    });
  }
  const supportNeg = firstNegatedMatch(utterance, SUPPORT_TERMS, "support");
  if (supportNeg) {
    notes.push({
      kind: "support",
      label: "Support contact described as not arranged",
      evidenceQuote: supportNeg,
    });
  }
  return notes;
}

export function detectAmbiguousKinds(
  utterance: string,
  hazardId: PlanHazardId = "hurricane",
): ComplicationKind[] {
  const kinds: ComplicationKind[] = [];
  if (hasHedgedMatch(utterance, COMMUNICATION_METHODS.flatMap((method) => method.terms), "communication")) {
    kinds.push("communication");
  }
  if (hasHedgedMatch(utterance, SUPPORT_TERMS, "support")) kinds.push("support");
  if (hasHedgedMatch(utterance, ELEVATOR_TERMS, "elevator")) kinds.push("elevator");
  if (hasHedgedMatch(utterance, EXIT_TERMS, "blocked-exit")) kinds.push("blocked-exit");
  if (hasHedgedMatch(utterance, SHELTER_TERMS, "shelter-access") && !ACCESS_UNRESOLVED.test(utterance)) {
    kinds.push("shelter-access");
  }
  const allowed = new Set(getHazardConfig(hazardId).kinds);
  return kinds.filter((kind) => allowed.has(kind));
}

export function groundedSummary(summary: string, utterance: string): string {
  const methods = detectCommMethods(utterance);
  const onlyPhone = /\b(only|just|relying only on)\b[\s\S]{0,24}\bphone\b|\bphone\b[\s\S]{0,18}\bonly\b/i.test(summary);
  if (methods.length >= 2 && onlyPhone) {
    return `You reported more than one way to get updates, including ${methods.join(" and ")}.`;
  }
  if (methods.length >= 2 && /\bonly (a |my )?phone\b/i.test(summary)) {
    return `You reported more than one way to get updates, including ${methods.join(" and ")}.`;
  }
  return summary;
}

export function labelForKind(kind: ComplicationKind, evidenceQuote: string): string {
  if (kind === "communication") return `Named communication method (${clipLabel(evidenceQuote)})`;
  if (kind === "support") return `Named support contact (${clipLabel(evidenceQuote)})`;
  if (kind === "shelter-access") return `Unresolved shelter access (${clipLabel(evidenceQuote)})`;
  if (kind === "alarm-perception") return `Alarm signal may not be perceived (${clipLabel(evidenceQuote)})`;
  if (kind === "blocked-exit") return `Named planned exit (${clipLabel(evidenceQuote)})`;
  return `Mentioned elevator (${clipLabel(evidenceQuote)})`;
}

function detectShelterAccess(utterance: string): PlanDependency | null {
  if (!ACCESS_UNRESOLVED.test(utterance)) return null;
  for (const match of collectMatches(utterance, SHELTER_TERMS)) {
    return {
      kind: "shelter-access",
      label: `Named shelter with unresolved access (${clipLabel(match.snippet)})`,
      evidenceQuote: match.snippet,
    };
  }
  return null;
}

function detectAlarmPerception(utterance: string): PlanDependency | null {
  if (!PERCEPTION_LIMIT.test(utterance)) return null;
  for (const match of collectMatches(utterance, ALARM_TERMS)) {
    if (PREFIX_NEGATION.test(match.before) && !PERCEPTION_LIMIT.test(match.sentence)) continue;
    if (/\b(do not|don't|does not|doesn't|did not|didn't|haven'?t|have not)\s+(have|use)\b/i.test(match.before)) {
      continue;
    }
    return {
      kind: "alarm-perception",
      label: `Alarm signal the user said they may not perceive (${clipLabel(match.snippet)})`,
      evidenceQuote: match.snippet,
    };
  }
  return null;
}

function firstPositiveMatch(utterance: string, terms: string[], kind: ComplicationKind): string | null {
  for (const match of collectMatches(utterance, terms)) {
    if (isHedgedMatch(match)) continue;
    if (isNegatedMatch(match, kind)) continue;
    return match.snippet;
  }
  return null;
}

function firstNegatedMatch(utterance: string, terms: string[], kind: ComplicationKind): string | null {
  for (const match of collectMatches(utterance, terms)) {
    if (isNegatedMatch(match, kind)) return match.snippet;
  }
  return null;
}

function hasHedgedMatch(utterance: string, terms: string[], kind: ComplicationKind): boolean {
  return collectMatches(utterance, terms).some((match) => isHedgedMatch(match) && !isNegatedMatch(match, kind));
}

function isHedgedMatch(match: TermMatch): boolean {
  return HEDGE_PATTERN.test(match.before);
}

interface TermMatch {
  sentence: string;
  before: string;
  after: string;
  snippet: string;
}

function collectMatches(utterance: string, terms: string[]): TermMatch[] {
  const text = utterance.replace(/\s+/g, " ").trim();
  const lower = text.toLowerCase();
  const matches: TermMatch[] = [];
  const seen = new Set<number>();
  const sorted = [...terms].sort((a, b) => b.length - a.length);
  for (const term of sorted) {
    let from = 0;
    while (from < lower.length) {
      const index = lower.indexOf(term.toLowerCase(), from);
      if (index === -1) break;
      from = index + term.length;
      if (seen.has(index)) continue;
      seen.add(index);
      const bounds = sentenceBounds(text, index);
      const sentence = text.slice(bounds.start, bounds.end);
      const relative = index - bounds.start;
      matches.push({
        sentence,
        before: sentence.slice(0, relative),
        after: sentence.slice(relative + term.length),
        snippet: clipAround(text, index, term.length),
      });
    }
  }
  return matches;
}

function isNegatedMatch(match: TermMatch, kind: ComplicationKind): boolean {
  if (kind === "support" && SUPPORT_FAILURE_AFTER.test(match.after)) return true;
  if (kind === "support" && SUPPORT_FAILURE_AFTER.test(match.sentence)) return true;
  const nearby = lastWords(match.before, 10);
  const withoutPerception = nearby.replace(PERCEPTION_LIMIT, " ");
  return PREFIX_NEGATION.test(withoutPerception);
}

function lastWords(text: string, count: number): string {
  const words = text.trim().split(/\s+/);
  return words.slice(-count).join(" ");
}

function sentenceBounds(text: string, index: number): { start: number; end: number } {
  let start = 0;
  let end = text.length;
  for (let i = index; i >= 0; i -= 1) {
    if (".!?".includes(text[i] ?? "")) {
      start = i + 1;
      break;
    }
  }
  for (let i = index; i < text.length; i += 1) {
    if (".!?".includes(text[i] ?? "")) {
      end = i + 1;
      break;
    }
  }
  while (start < end && text[start] === " ") start += 1;
  return { start, end };
}

export function detectOtherPlanningTasks(utterance: string): { kind: ComplicationKind; text: string }[] {
  const tasks: { kind: ComplicationKind; text: string }[] = [];
  const text = utterance.replace(/\s+/g, " ").trim();
  if (!text) return tasks;
  const sentences = text.split(/(?<=[.!?])\s+/);
  for (const sentence of sentences) {
    if (
      /\b(haven'?t|have not|not yet|still need to)\b/i.test(sentence) &&
      /\b(another|other|second)\b/i.test(sentence) &&
      /\b(support person|support network|backup person|contact)\b/i.test(sentence)
    ) {
      tasks.push({ kind: "support", text: sentence.replace(/[.!?]+$/, "").trim() });
    }
  }
  return tasks;
}

function clipAround(text: string, index: number, termLength: number): string {
  const start = Math.max(0, index - 28);
  const end = Math.min(text.length, index + termLength + 32);
  return text.slice(start, end).trim();
}

function clipLabel(text: string): string {
  const compact = text.replace(/\s+/g, " ").trim();
  return compact.length > 48 ? `${compact.slice(0, 45)}…` : compact;
}
