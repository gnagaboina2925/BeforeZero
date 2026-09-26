import type { LessonOverlayId } from "../lesson/catalog.ts";
import type { LessonSourceId } from "../lesson/sources.ts";
import type { ComplicationKind, PlanChoice, PlanPreferenceFlags } from "./types.ts";

export const PLAN_PROMPT =
  "Before a hurricane, how would you receive updates, contact someone, and arrange any help you might need?";

export const PLAN_EXAMPLE = {
  label: "Labeled fictional example",
  text: "In this labeled example, Sam gets Wireless Emergency Alerts on a phone, texts a neighbor named Lee, and lives on a floor that uses an elevator. This is not a real household.",
};

export const DEFAULT_PLAN_PREFS: PlanPreferenceFlags = {
  spokenGuidance: false,
  captions: true,
  plainLanguage: false,
  stepFree: false,
  supportPerson: false,
};

export interface ComplicationCopy {
  kind: ComplicationKind;
  title: string;
  happening: string;
  whatToDo: string;
  whatToDoPlain: string;
  whyItMatters: string;
  whatToAvoid: string;
  caption: string;
  narration: string;
  revisePrompt: string;
  mediaBeatId: string;
  overlay: LessonOverlayId;
  sourceIds: LessonSourceId[];
  choices: PlanChoice[];
}

export const COMPLICATIONS: Record<ComplicationKind, ComplicationCopy> = {
  communication: {
    kind: "communication",
    title: "Practice moment: the named communication method is unavailable",
    happening:
      "Fictional complication. The communication method you named is not working in this rehearsal. This is not a live outage.",
    whatToDo:
      "Ready.gov: have several ways to receive alerts. Sign up for community alerts. Wireless Emergency Alerts and the Emergency Alert System require no sign-up. NOAA Weather Radio is another official channel. Keep a cell phone charged and consider backup charging when a hurricane is in the forecast. This app is not an alert service.",
    whatToDoPlain:
      "Have more than one way to get alerts. Community alerts, Wireless Emergency Alerts, the Emergency Alert System, and NOAA Weather Radio are official options. This app will not warn you.",
    whyItMatters: "One phone, app, or text path can fail. Official alerts are not limited to a single device.",
    whatToAvoid: "Do not treat this website as a warning service. Do not invent a live outage for your area.",
    caption:
      "Fictional rehearsal: the method you named cannot be used. Ready.gov: several ways to receive alerts, including community alerts, WEA, EAS, and NOAA Weather Radio.",
    narration:
      "This is a fictional rehearsal. The communication method you named is not working here. Ready.gov says to have several ways to receive alerts. Wireless Emergency Alerts and the Emergency Alert System do not require sign-up. NOAA Weather Radio is another official channel. This app will not warn you in a real storm.",
    revisePrompt: "If that named method were unavailable, how would you still get updates before a hurricane?",
    mediaBeatId: "demo-alerts",
    overlay: "alert-card",
    sourceIds: [
      "ready-hurricanes-alerts",
      "ready-alerts-wea",
      "ready-alerts-eas",
      "ready-alerts-nwr",
      "ready-hurricanes-during-informed",
    ],
    choices: [
      {
        id: "second-alert-channel",
        label: "I would also use another official channel such as NOAA Weather Radio, WEA, EAS, or community alerts",
        fillsGap: true,
      },
      {
        id: "charge-backup",
        label: "I would keep a charged phone and a backup charging device when a hurricane is in the forecast",
        fillsGap: true,
      },
      {
        id: "same-method-only",
        label: "I would keep using only the same method I already named",
        fillsGap: false,
      },
    ],
  },
  support: {
    kind: "support",
    title: "Practice moment: the planned support person cannot be reached",
    happening:
      "Fictional complication. The person you named cannot be reached in this rehearsal. This is not a live missing-person event.",
    whatToDo:
      "Ready.gov: create a support network of people who can help you in a disaster. Keep a contact list. Identify extra help before an emergency if anyone may need it. Ask your local emergency management office about voluntary assistance registries. This app cannot promise that help will arrive.",
    whatToDoPlain:
      "Plan more than one person who can help. Keep their contact information. Ask local emergency management about voluntary registries. This app cannot send help.",
    whyItMatters: "One named person can be unavailable. Ready.gov treats a support network as preparation, not a guarantee.",
    whatToAvoid: "Do not treat a registry or this app as a promise that assistance will arrive.",
    caption:
      "Fictional rehearsal: the named support person cannot be reached. Ready.gov: a support network, a contact list, and optional local registries. This app cannot promise help.",
    narration:
      "This is a fictional rehearsal. The person you named cannot be reached here. Ready.gov says to create a support network and keep a contact list. Ask local emergency management about voluntary registries. This app cannot promise that help will arrive.",
    revisePrompt: "If that person could not be reached, how would you still arrange contact or extra help before a hurricane?",
    mediaBeatId: "teach-prep",
    overlay: "none",
    sourceIds: [
      "ready-disability-network",
      "ready-hurricanes-plan-disability",
      "ready-disability-registry",
      "ready-hurricanes-plan",
    ],
    choices: [
      {
        id: "second-contact",
        label: "I would name at least one other person in a support network and keep a contact list",
        fillsGap: true,
      },
      {
        id: "ask-registry",
        label: "I would ask local emergency management about a voluntary assistance registry, knowing it is not a guarantee",
        fillsGap: true,
      },
      {
        id: "same-person-only",
        label: "I would keep relying only on the same person I already named",
        fillsGap: false,
      },
    ],
  },
  elevator: {
    kind: "elevator",
    title: "Practice moment: a mentioned elevator is unavailable",
    happening:
      "Fictional complication. The elevator you mentioned is not working in this rehearsal. This is not a live building emergency.",
    whatToDo:
      "Ready.gov: do not use elevators in a high-rise emergency plan. Plan ahead for accessible transportation you may need during or after a disaster. Communicate with neighbors who can assist if you need to evacuate the building. Follow local officials. Stairs are not assumed to be usable for everyone. This app cannot promise assistance and does not invent a route.",
    whatToDoPlain:
      "Do not plan on the elevator. Ask about accessible transportation and whether a neighbor can assist. Follow local officials. This app cannot carry anyone or promise help.",
    whyItMatters: "An elevator can stop working. Official guidance is to plan without using it, not to invent a new path in this app.",
    whatToAvoid:
      "Do not use elevators. Do not invent an evacuation route. Do not plan on someone carrying you. This app cannot promise that help will arrive.",
    caption:
      "Fictional rehearsal: the mentioned elevator is unavailable. Ready.gov: do not use elevators. Plan accessible transportation. Neighbors may assist; this is not a guarantee. Follow local officials.",
    narration:
      "This is a fictional rehearsal. The elevator you mentioned is not working here. Ready.gov says not to use elevators. Plan ahead for accessible transportation. You can talk with neighbors who might assist if you need to leave a building. Stairs are not assumed for everyone. This app cannot promise help and does not invent a route.",
    revisePrompt: "If that elevator were unavailable, what would you confirm before a hurricane?",
    mediaBeatId: "teach-prep",
    overlay: "none",
    sourceIds: [
      "ready-high-rise-elevators",
      "ready-disability-transport",
      "ready-disability-neighbors",
      "ready-hurricanes-evac-zone",
    ],
    choices: [
      {
        id: "accessible-transport",
        label: "I would confirm accessible transportation with local transit or emergency management",
        fillsGap: true,
      },
      {
        id: "neighbor-assist",
        label: "I would talk with a neighbor who might assist, knowing this app cannot promise that help",
        fillsGap: true,
      },
      {
        id: "carry-or-invent",
        label: "I would have someone carry me, or I would invent a new route in this app",
        fillsGap: false,
      },
    ],
  },
};

export const FALLBACK_DEPENDENCY_CHOICES: { id: ComplicationKind; label: string }[] = [
  { id: "communication", label: "My words named a phone, radio, alert, or other way to get updates" },
  { id: "support", label: "My words named a person who would help or be contacted" },
  { id: "elevator", label: "My words mentioned an elevator" },
];

export const REHEARSAL_CHOICE_PROMPT = "Which part would you like to rehearse?";

export const REHEARSAL_CHOICE_LABELS: Record<ComplicationKind, string> = {
  communication: "Communication method unavailable",
  support: "The planned support person cannot be reached",
  elevator: "A mentioned elevator is unavailable",
};

export const STEP_FREE_NOTE =
  "Step-free access: this rehearsal does not assume stairs, crawling, or carrying. Ready.gov says to plan accessible transportation and extra help before an emergency.";

export const SUPPORT_PERSON_NOTE =
  "If you are planning with a support person, include how each of you would get updates and how you would reach each other. You do not need to give real names.";
