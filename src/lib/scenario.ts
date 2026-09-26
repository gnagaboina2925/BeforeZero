import type {
  Answers,
  Choice,
  HouseholdId,
  HouseholdOption,
  Question,
  StepId,
} from "./types.ts";
import {
  CABINET_FOLLOW_UP,
  CANDLE_FOLLOW_UP,
  CANDLE_HINT,
  FLASHLIGHT_FOLLOW_UP,
  KIT_LOCATION_FOLLOW_UP,
  MEETING_IF_SEPARATED_FOLLOW_UP,
  MEETING_PLACE_FOLLOW_UP,
  MEETING_PLACE_HINT,
  MEETING_PLACE_LABEL,
  PHONE_CONTACT_FOLLOW_UP,
  PHONE_LIGHT_FOLLOW_UP,
  SUPPLY_GAP_FOLLOW_UP,
  UPDATES_FOLLOW_UP,
} from "./guidance.ts";

export const PRODUCT_NAME = "BeforeZero";
export const TAGLINE = "Practice before it matters.";
export const PRACTICE_DISCLAIMER =
  "Practice simulation — not live emergency guidance.";
export const PROTOTYPE_LABEL = "Scripted prototype";

export const STEP_ORDER: StepId[] = [
  "lighting",
  "contact",
  "commBackup",
  "supplies",
  "openDetail",
];

export const HOUSEHOLD_IDS: HouseholdId[] = ["alone", "roommates", "family"];

export const HOUSEHOLD_OPTIONS: HouseholdOption[] = [
  {
    id: "alone",
    label: "Living alone",
    description: "You are the only person in the household.",
  },
  {
    id: "roommates",
    label: "With roommates",
    description: "You share a home with one or more roommates.",
  },
  {
    id: "family",
    label: "With family",
    description: "You live with family members in the same household.",
  },
];

export const PHONE_BATTERY_PROMPT =
  "In this practice scenario, your phone battery is now nearly empty. You chose it for both lighting and communication. What backup would you use?";
export const SIMULATED_BATTERY_EVENT_NOTICE =
  "Simulated practice event — not a real battery reading or prediction.";

const LIGHTING_CHOICE_IDS = new Set([
  "known-flashlight",
  "phone-light",
  "candles",
  "unplanned",
]);
const CONTACT_CHOICE_IDS = new Set([
  "phone",
  "internet-message",
  "in-person",
  "unplanned",
]);

const UNPLANNED: Choice = {
  id: "unplanned",
  label: "I haven't planned this yet",
  kind: "gap",
};

const MEETING_PLACE_CHOICE: Choice = {
  id: "meeting-place",
  label: MEETING_PLACE_LABEL,
  kind: "planned",
  hint: MEETING_PLACE_HINT,
  preparationTask: MEETING_PLACE_FOLLOW_UP,
};

function householdPeople(household: HouseholdId): string {
  if (household === "alone") return "someone you trust";
  if (household === "roommates") return "your roommates";
  return "your household members";
}

function isSolo(household: HouseholdId): boolean {
  return household === "alone";
}

function lightingQuestion(household: HouseholdId): Question {
  const solo = isSolo(household);
  return {
    id: "lighting",
    stepId: "lighting",
    title: "Finding lighting",
    prompt:
      "If the lights go out at home, where would you look first for lighting?",
    choices: [
      {
        id: "known-flashlight",
        label: solo
          ? "Flashlights or lanterns I keep in a known place"
          : "Flashlights or lanterns we keep in a known place",
        kind: "planned",
        preparationTask: FLASHLIGHT_FOLLOW_UP,
      },
      {
        id: "phone-light",
        label: "The flashlight on a phone",
        kind: "planned",
        preparationTask: PHONE_LIGHT_FOLLOW_UP,
      },
      {
        id: "candles",
        label: solo
          ? "Candles, matches, or a lighter I already have"
          : "Candles, matches, or a lighter we already have",
        kind: "planned",
        hint: CANDLE_HINT,
        preparationTask: CANDLE_FOLLOW_UP,
      },
      {
        ...UNPLANNED,
        preparationTask: solo
          ? "Choose a flashlight I can find in the dark, and keep extra batteries with it."
          : "Choose a flashlight for each household member and agree on where it is kept, with extra batteries.",
      },
    ],
  };
}

function contactQuestion(household: HouseholdId): Question {
  const people = householdPeople(household);
  const solo = isSolo(household);
  const prompt = solo
    ? "If the power goes out, how would you reach someone you trust?"
    : `If the power goes out, how would you reach ${people}?`;

  return {
    id: `contact-${household}`,
    stepId: "contact",
    title: solo ? "Contacting someone you trust" : "Contacting household members",
    prompt,
    choices: [
      {
        id: "phone",
        label: "A phone call or text message",
        kind: "planned",
        preparationTask: PHONE_CONTACT_FOLLOW_UP,
      },
      {
        id: "internet-message",
        label: "Internet messaging (apps that need data or Wi-Fi)",
        kind: "planned",
      },
      {
        id: "in-person",
        label: solo
          ? "In person, if I am in the same place"
          : "In person, if we are in the same place",
        kind: "planned",
      },
      {
        ...UNPLANNED,
        preparationTask: solo
          ? "Choose a first way to contact someone I trust."
          : `Agree on a first way to contact ${people}.`,
      },
    ],
  };
}

function commBackupQuestion(household: HouseholdId, answers: Answers): Question {
  const people = householdPeople(household);
  const solo = isSolo(household);
  const contactChoice = answers.contact;
  const alreadyHaveDevice = solo
    ? "Another charged phone or device I already have"
    : "Another charged phone or device we already have";
  const backupUnplannedTask = solo
    ? "Choose a backup way to reach someone I trust that does not depend on this phone."
    : "Agree on a backup way to reach people that does not depend on this phone.";

  if (isPhoneDependentComplication(answers)) {
    return {
      id: "backup-phone-battery",
      stepId: "commBackup",
      title: "Communication backup",
      eventNotice: SIMULATED_BATTERY_EVENT_NOTICE,
      prompt: PHONE_BATTERY_PROMPT,
      choices: [
        {
          id: "another-charged-device",
          label: alreadyHaveDevice,
          kind: "planned",
        },
        MEETING_PLACE_CHOICE,
        {
          id: "unplanned",
          label: "I haven't planned this yet",
          kind: "gap",
          preparationTask: backupUnplannedTask,
        },
      ],
    };
  }

  if (contactChoice === "internet-message") {
    return {
      id: "backup-internet",
      stepId: "commBackup",
      title: "Communication backup",
      prompt: `If internet access is unavailable, what is your backup way to reach ${people}?`,
      choices: [
        {
          id: "cellular",
          label: "A voice call or SMS on a cellular network",
          kind: "planned",
        },
        MEETING_PLACE_CHOICE,
        {
          id: "unplanned",
          label: "I haven't planned this yet",
          kind: "gap",
          preparationTask: solo
            ? "Choose a backup way to contact someone I trust when internet access is unavailable."
            : `Agree on a backup way to contact ${people} when internet access is unavailable.`,
        },
      ],
    };
  }

  if (contactChoice === "phone") {
    return {
      id: "backup-phone",
      stepId: "commBackup",
      title: "Communication backup",
      prompt: `If calls and texts are delayed or unavailable, what is your backup way to reach ${people}?`,
      choices: [
        {
          id: "internet-when-available",
          label: "Internet messaging if data or Wi-Fi still works",
          kind: "planned",
        },
        MEETING_PLACE_CHOICE,
        {
          id: "unplanned",
          label: "I haven't planned this yet",
          kind: "gap",
          preparationTask: solo
            ? "Choose a backup way to contact someone I trust if calls and texts are delayed."
            : `Agree on a backup way to contact ${people} if calls and texts are delayed.`,
        },
      ],
    };
  }

  if (contactChoice === "in-person") {
    return {
      id: "backup-in-person",
      stepId: "commBackup",
      title: "Communication backup",
      prompt: solo
        ? "If you are not in the same place, how would you reconnect with someone you trust?"
        : `If you are not in the same place, how would you reconnect with ${people}?`,
      choices: [
        {
          id: "phone-or-text",
          label: "A phone call or text message",
          kind: "planned",
        },
        MEETING_PLACE_CHOICE,
        {
          id: "unplanned",
          label: "I haven't planned this yet",
          kind: "gap",
          preparationTask: solo
            ? "Choose a backup way to contact someone I trust if I am not in the same place."
            : `Agree on a backup way to contact ${people} if you are not in the same place.`,
        },
      ],
    };
  }

  return {
    id: "backup-unplanned-contact",
    stepId: "commBackup",
    title: "Communication backup",
    prompt: solo
      ? "What would you like to set as a first contact method to decide later?"
      : `What would you like to set as a first contact method to discuss with ${people} later?`,
    choices: [
      {
        id: "share-numbers",
        label: solo ? "A phone number for someone I trust" : "A phone number for each person",
        kind: "planned",
      },
        MEETING_PLACE_CHOICE,
      {
        id: "unplanned",
        label: "I haven't planned this yet",
        kind: "gap",
        preparationTask: solo
          ? "Choose a backup way to contact someone I trust."
          : `Agree on a backup way to contact ${people}.`,
      },
    ],
  };
}

function suppliesQuestion(household: HouseholdId): Question {
  const solo = isSolo(household);
  return {
    id: "supplies",
    stepId: "supplies",
    title: "Locating supplies",
    prompt:
      "Where would you look for basic supplies such as water, a first-aid kit, or extra batteries?",
    choices: [
      {
        id: "known-kit",
        label: solo ? "A kit I keep in a known place" : "A kit we keep in a known place",
        kind: "planned",
        preparationTask: KIT_LOCATION_FOLLOW_UP,
      },
      {
        id: "cabinets",
        label: "Kitchen, bathroom, or closet shelves",
        kind: "planned",
        preparationTask: CABINET_FOLLOW_UP,
      },
      {
        id: "figure-out",
        label: "I would figure it out at the time",
        kind: "gap",
        preparationTask: SUPPLY_GAP_FOLLOW_UP,
      },
      {
        id: "unplanned",
        label: "I haven't planned this yet",
        kind: "gap",
        preparationTask: SUPPLY_GAP_FOLLOW_UP,
      },
    ],
  };
}

function openDetailQuestion(household: HouseholdId): Question {
  const solo = isSolo(household);

  return {
    id: "open-detail",
    stepId: "openDetail",
    title: "An unanswered plan detail",
    prompt: solo
      ? "Which plan detail still feels unanswered after this practice?"
      : "Which household detail still feels unanswered after this practice?",
    choices: [
      {
        id: "meeting-if-separated",
        label: solo
          ? "Where I would meet someone if I am separated"
          : "Where we would meet if we are separated",
        kind: "gap",
        preparationTask: MEETING_IF_SEPARATED_FOLLOW_UP,
      },
      {
        id: "check-on-others",
        label: "Who is responsible for checking on a neighbor or pet",
        kind: "gap",
        preparationTask: solo
          ? "Decide who checks on a neighbor or pet, and write that down."
          : "Decide who checks on a neighbor or pet, and write that down for the household.",
      },
      {
        id: "supply-duration",
        label: solo
          ? "How long my current supplies would last"
          : "How long our current supplies would last",
        kind: "gap",
        preparationTask: solo
          ? "Review what food and water I already have. Ready.gov recommends non-perishable food and water for several days; this practice cannot say how long a household’s supplies would last."
          : "Review what food and water you already have. Ready.gov recommends non-perishable food and water for several days; this practice cannot say how long a household’s supplies would last.",
      },
      {
        id: "updates",
        label: solo
          ? "Whether I have a way to get updates without relying on one device"
          : "Whether we have a way to get updates without relying on one device",
        kind: "gap",
        preparationTask: UPDATES_FOLLOW_UP,
      },
    ],
  };
}

export function getQuestion(
  stepId: StepId,
  household: HouseholdId,
  answers: Answers,
): Question {
  switch (stepId) {
    case "lighting":
      return lightingQuestion(household);
    case "contact":
      return contactQuestion(household);
    case "commBackup":
      return commBackupQuestion(household, answers);
    case "supplies":
      return suppliesQuestion(household);
    case "openDetail":
      return openDetailQuestion(household);
  }
}

export function isPhoneDependentComplication(answers: Answers): boolean {
  return answers.lighting === "phone-light" && answers.contact === "phone";
}

export function spokenQuestionText(question: Question): string {
  return [question.eventNotice, question.prompt].filter(Boolean).join(" ");
}

export function parseScenarioPriorAnswers(stepId: StepId, value: unknown): Answers {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }
  const record = value as Record<string, unknown>;
  return priorAnswersForStep(stepId, {
    lighting: typeof record.lighting === "string" ? record.lighting : undefined,
    contact: typeof record.contact === "string" ? record.contact : undefined,
    commBackup: typeof record.commBackup === "string" ? record.commBackup : undefined,
    supplies: typeof record.supplies === "string" ? record.supplies : undefined,
    openDetail: typeof record.openDetail === "string" ? record.openDetail : undefined,
  });
}

export function getDependentSteps(changedStep: StepId): StepId[] {
  if (changedStep === "contact" || changedStep === "lighting") {
    return ["commBackup"];
  }
  return [];
}

export function priorAnswersForStep(stepId: StepId, answers: Answers): Answers {
  if (stepId !== "commBackup") {
    return {};
  }
  const prior: Answers = {};
  if (answers.contact && CONTACT_CHOICE_IDS.has(answers.contact)) {
    prior.contact = answers.contact;
  }
  if (answers.lighting && LIGHTING_CHOICE_IDS.has(answers.lighting)) {
    prior.lighting = answers.lighting;
  }
  return prior;
}

export function householdLabel(household: HouseholdId): string {
  const option = HOUSEHOLD_OPTIONS.find((item) => item.id === household);
  return option?.label ?? household;
}
