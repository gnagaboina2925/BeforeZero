import type { PlatformLessonId } from "../lesson/lessons.ts";
import {
  COMPLICATIONS,
  FALLBACK_DEPENDENCY_CHOICES,
  PLAN_EXAMPLE,
  PLAN_PROMPT,
  REHEARSAL_CHOICE_LABELS,
  STEP_FREE_NOTE,
  type ComplicationCopy,
} from "./catalog.ts";
import { HOME_FIRE_COMPLICATIONS, HOME_FIRE_PLAN_EXAMPLE, HOME_FIRE_PLAN_PROMPT, HOME_FIRE_STEP_FREE_NOTE } from "./homeFire.ts";
import { TORNADO_COMPLICATIONS, TORNADO_PLAN_EXAMPLE, TORNADO_PLAN_PROMPT, TORNADO_STEP_FREE_NOTE } from "./tornado.ts";
import {
  PLAN_HAZARD_IDS,
  type ComplicationKind,
  type ObservationTopic,
  type PlanHazardId,
} from "./types.ts";

export interface PlanHazardConfig {
  id: PlanHazardId;
  lessonId: PlatformLessonId;
  kicker: string;
  heading: string;
  lede: string;
  prompt: string;
  settingNote: string;
  example: { label: string; text: string };
  backHref: string;
  backLabel: string;
  kinds: readonly ComplicationKind[];
  observationTopics: readonly ObservationTopic[];
  topicToKind: Partial<Record<ObservationTopic, ComplicationKind>>;
  complications: Partial<Record<ComplicationKind, ComplicationCopy>>;
  choiceLabels: Record<ComplicationKind, string>;
  dependencyChoices: { id: ComplicationKind; label: string }[];
  exampleKind: ComplicationKind;
  stepFreeNote: string;
  grokFocus: string;
}

const HURRICANE: PlanHazardConfig = {
  id: "hurricane",
  lessonId: "hurricane-flood-1",
  kicker: "Hurricane preparation rehearsal",
  heading: "Rehearse my plan",
  lede: "Explore dependencies in a preparation plan. This is not live emergency advice and not a verified assessment.",
  prompt: PLAN_PROMPT,
  settingNote: "Hurricane and heavy-rain preparation. Flooding instructions stay separate from sheltering in this rehearsal.",
  example: PLAN_EXAMPLE,
  backHref: "/practice/hurricane",
  backLabel: "Back to hurricane lesson",
  kinds: ["communication", "support", "elevator"],
  observationTopics: ["alerts", "support", "access"],
  topicToKind: { alerts: "communication", support: "support", access: "elevator" },
  complications: COMPLICATIONS,
  choiceLabels: REHEARSAL_CHOICE_LABELS,
  dependencyChoices: FALLBACK_DEPENDENCY_CHOICES,
  exampleKind: "communication",
  stepFreeNote: STEP_FREE_NOTE,
  grokFocus:
    "You extract grounded observations from a user's hurricane preparation plan. Supported dependencies are a named communication method, a named support person, and a mentioned elevator. Do not treat negated wording as a dependency. 'I do not use an elevator' is not elevator dependence and does not make access not-planned.",
};

const TORNADO: PlanHazardConfig = {
  id: "tornado",
  lessonId: "tornado-home-1",
  kicker: "Tornado preparation rehearsal",
  heading: "Rehearse my plan",
  lede: "Explore dependencies in a preparation plan for this sturdy home with a basement. This is not live emergency advice and not a verified assessment.",
  prompt: TORNADO_PLAN_PROMPT,
  settingNote:
    "This rehearsal stays in a sturdy house with a basement. It is not a mobile home or vehicle scene. Do not mix in flood or home-fire instructions.",
  example: TORNADO_PLAN_EXAMPLE,
  backHref: "/practice/tornado",
  backLabel: "Back to tornado lesson",
  kinds: ["communication", "support", "shelter-access"],
  observationTopics: ["alerts", "support", "access"],
  topicToKind: { alerts: "communication", support: "support", access: "shelter-access" },
  complications: TORNADO_COMPLICATIONS,
  choiceLabels: REHEARSAL_CHOICE_LABELS,
  dependencyChoices: [
    { id: "communication", label: "My words named a phone, radio, alert, or other way to get a watch or warning" },
    { id: "support", label: "My words named a person who would help or be contacted" },
    { id: "shelter-access", label: "My words named a shelter and said access to it is still unresolved" },
  ],
  exampleKind: "communication",
  stepFreeNote: TORNADO_STEP_FREE_NOTE,
    grokFocus:
    "You extract grounded observations from a user's tornado plan for a sturdy home with a basement. Supported dependencies are a named alert method, a named support person, and unresolved access to a named shelter. A named basement plus words that access is still unresolved, including 'I haven't arranged how to reach it' where 'it' refers to that shelter, is a shelter-access dependency. Copy complete short excerpts from the user's words. Do not infer unresolved access from a wheelchair or disability mention alone, and do not treat a named basement by itself as unresolved access. Do not treat this as a mobile home, vehicle, flood, or home-fire scene.",
};

const HOME_FIRE: PlanHazardConfig = {
  id: "home-fire",
  lessonId: "home-fire-1",
  kicker: "Home-fire preparation rehearsal",
  heading: "Rehearse my plan",
  lede: "Explore dependencies in a preparation plan for this one-story house. This is not live emergency advice and not a verified assessment.",
  prompt: HOME_FIRE_PLAN_PROMPT,
  settingNote:
    "This rehearsal stays in a fictional one-story house with a ground-floor bedroom. Do not mix in tornado sheltering or flood instructions.",
  example: HOME_FIRE_PLAN_EXAMPLE,
  backHref: "/practice/home-fire",
  backLabel: "Back to home-fire lesson",
  kinds: ["alarm-perception", "blocked-exit", "support"],
  observationTopics: ["alarm", "exit", "support"],
  topicToKind: { alarm: "alarm-perception", exit: "blocked-exit", support: "support" },
  complications: HOME_FIRE_COMPLICATIONS,
  choiceLabels: REHEARSAL_CHOICE_LABELS,
  dependencyChoices: [
    { id: "alarm-perception", label: "My words said I may not perceive an alarm signal this plan relies on" },
    { id: "blocked-exit", label: "My words named an exit I would use" },
    { id: "support", label: "My words named a person who would help or be contacted" },
  ],
  exampleKind: "alarm-perception",
  stepFreeNote: HOME_FIRE_STEP_FREE_NOTE,
  grokFocus:
    "You extract grounded observations from a user's home-fire plan for a one-story house. Supported dependencies are: an alarm signal the user explicitly says they may not perceive; a named planned exit; and a named support person. Naming a smoke alarm is not a perception concern unless the user describes difficulty noticing its signal. Do not infer that the alarm is suitable or verified. Do not infer alarm-perception from a disability or accessibility preference. Require the user's words that they may not hear, see, or otherwise perceive the alarm. Do not mix tornado sheltering or flooding.",
};

const BY_ID: Record<PlanHazardId, PlanHazardConfig> = {
  hurricane: HURRICANE,
  tornado: TORNADO,
  "home-fire": HOME_FIRE,
};

export function isPlanHazardId(value: string): value is PlanHazardId {
  return (PLAN_HAZARD_IDS as readonly string[]).includes(value);
}

export function getHazardConfig(hazardId: PlanHazardId = "hurricane"): PlanHazardConfig {
  return BY_ID[hazardId] ?? HURRICANE;
}

export function rehearsePlanHref(lessonId: PlatformLessonId): string {
  if (lessonId === "tornado-home-1") return "/practice/tornado/rehearse-plan";
  if (lessonId === "home-fire-1") return "/practice/home-fire/rehearse-plan";
  return "/practice/hurricane/rehearse-plan";
}

export function complicationCopy(hazardId: PlanHazardId, kind: ComplicationKind): ComplicationCopy | null {
  return getHazardConfig(hazardId).complications[kind] ?? null;
}
