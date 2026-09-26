import {
  ACCESS_PREP_NOTE,
  LESSON_BEATS,
  LESSON_ID,
  LESSON_SOURCE_LINKS,
  LESSON_TAKEAWAYS,
  PREPARE_CHECKLIST,
  beatById,
  beatsForMode,
  practiceFeedback,
  type LessonActionId,
  type LessonBeat,
  type PracticeFeedback,
} from "./catalog.ts";
import {
  HOME_FIRE_ACCESS_NOTE,
  HOME_FIRE_BEATS,
  HOME_FIRE_LESSON_ID,
  HOME_FIRE_PREPARE_CHECKLIST,
  HOME_FIRE_SOURCE_LINKS_FOR_LESSON,
  HOME_FIRE_TAKEAWAYS,
  homeFireBeatById,
  homeFireBeatsForMode,
  homeFirePracticeFeedback,
} from "./home-fire.ts";
import {
  TORNADO_ACCESS_NOTE,
  TORNADO_BEATS,
  TORNADO_LESSON_ID,
  TORNADO_PREPARE_CHECKLIST,
  TORNADO_SOURCE_LINKS_FOR_LESSON,
  TORNADO_TAKEAWAYS,
  tornadoBeatById,
  tornadoBeatsForMode,
  tornadoPracticeFeedback,
} from "./tornado.ts";

export type PlatformLessonId = typeof LESSON_ID | typeof TORNADO_LESSON_ID | typeof HOME_FIRE_LESSON_ID;

export interface LessonDefinition {
  id: PlatformLessonId;
  slug: string;
  aliases: readonly string[];
  title: string;
  cardSummary: string;
  kicker: string;
  heading: string;
  lede: string;
  previewStill: string;
  previewCaption: string;
  previewNote: string;
  mediaBasePath: string;
  printTitle: string;
  objectives: readonly string[];
  beats: LessonBeat[];
  takeaways: readonly string[];
  prepareHeading: string;
  prepareChecklist: readonly { text: string }[];
  accessNote: { text: string };
  sourceLinks: readonly { title: string; url: string }[];
  beatsForMode: (mode: "guided" | "practice") => LessonBeat[];
  beatById: (id: string) => LessonBeat | undefined;
  practiceFeedback: (beatId: string, actionId: LessonActionId) => PracticeFeedback;
}

export const LESSON_DEFINITIONS: Record<PlatformLessonId, LessonDefinition> = {
  "hurricane-flood-1": {
    id: "hurricane-flood-1",
    slug: "hurricane",
    aliases: ["hurricane", "hurricane-flood-1"],
    title: "Hurricane, heavy rain & flooding",
    cardSummary: "Watch versus inland flooding, official instructions, and optional practice.",
    kicker: "Guided emergency training",
    heading: "Know what to do before the storm.",
    lede: "Watch clear demonstrations, hear each step, and practice at your pace.",
    previewStill: "/lesson/stills/watch.jpg",
    previewCaption: "Hurricane, heavy rain & flooding",
    previewNote: "Illustrative training scene",
    mediaBasePath: "/lesson",
    printTitle: "Hurricane and heavy rain",
    objectives: ["Prepare before the storm", "Understand sheltering instructions", "Respond to flooding"],
    beats: LESSON_BEATS,
    takeaways: LESSON_TAKEAWAYS,
    prepareHeading: "Prepare before a storm",
    prepareChecklist: PREPARE_CHECKLIST,
    accessNote: ACCESS_PREP_NOTE,
    sourceLinks: LESSON_SOURCE_LINKS,
    beatsForMode,
    beatById,
    practiceFeedback,
  },
  "tornado-home-1": {
    id: "tornado-home-1",
    slug: "tornado",
    aliases: ["tornado", "tornado-home-1"],
    title: "Tornado warning in a sturdy home",
    cardSummary: "Watch versus warning, a basement shelter plan, and access notes for one house type.",
    kicker: "Guided emergency training",
    heading: "Know the warning. Know this house’s shelter.",
    lede: "Learn watch versus warning, see a labeled diagram, and practice at your pace.",
    previewStill: "/lesson/tornado/stills/sky.jpg",
    previewCaption: "Tornado training: sturdy house with a basement",
    previewNote: "Labeled shelter diagram is the instruction. Generated clips are illustrative only.",
    mediaBasePath: "/lesson/tornado",
    printTitle: "Tornado warning in a sturdy home",
    objectives: [
      "Tell a watch from a warning",
      "Plan shelter in this sturdy home",
      "Take action on a fictional warning",
    ],
    beats: TORNADO_BEATS,
    takeaways: TORNADO_TAKEAWAYS,
    prepareHeading: "Prepare before severe weather",
    prepareChecklist: TORNADO_PREPARE_CHECKLIST,
    accessNote: TORNADO_ACCESS_NOTE,
    sourceLinks: TORNADO_SOURCE_LINKS_FOR_LESSON,
    beatsForMode: tornadoBeatsForMode,
    beatById: tornadoBeatById,
    practiceFeedback: tornadoPracticeFeedback,
  },
  "home-fire-1": {
    id: "home-fire-1",
    slug: "home-fire",
    aliases: ["home-fire", "home-fire-1"],
    title: "Home-fire preparation and escape",
    cardSummary: "Alarms, two ways out, a blocked-door complication, and access notes for one house type.",
    kicker: "Guided emergency training",
    heading: "Know the alarm. Know two ways out.",
    lede: "Learn a sourced escape plan, see a labeled diagram, and practice at your pace.",
    previewStill: "/lesson/home-fire/stills/escape-plan.svg",
    previewCaption: "Home-fire training: fictional one-story house",
    previewNote: "Labeled escape diagram is the instruction. Generated clips are illustrative only.",
    mediaBasePath: "/lesson/home-fire",
    printTitle: "Home-fire preparation and escape",
    objectives: [
      "Prepare alarms and an escape plan",
      "Leave when an alarm warns you",
      "Use a second way out or trapped-in-place steps",
    ],
    beats: HOME_FIRE_BEATS,
    takeaways: HOME_FIRE_TAKEAWAYS,
    prepareHeading: "Prepare before a fire",
    prepareChecklist: HOME_FIRE_PREPARE_CHECKLIST,
    accessNote: HOME_FIRE_ACCESS_NOTE,
    sourceLinks: HOME_FIRE_SOURCE_LINKS_FOR_LESSON,
    beatsForMode: homeFireBeatsForMode,
    beatById: homeFireBeatById,
    practiceFeedback: homeFirePracticeFeedback,
  },
};

export const LESSON_LIST = Object.values(LESSON_DEFINITIONS);

export function isPlatformLessonId(value: string): value is PlatformLessonId {
  return value === LESSON_ID || value === TORNADO_LESSON_ID || value === HOME_FIRE_LESSON_ID;
}

export function lessonIdFromSlug(slug: string): PlatformLessonId | null {
  for (const lesson of LESSON_LIST) {
    if (lesson.aliases.includes(slug)) return lesson.id;
  }
  return null;
}

export function getLesson(id: PlatformLessonId): LessonDefinition {
  return LESSON_DEFINITIONS[id];
}

export function actionLabelFromBeats(beats: LessonBeat[], actionId: LessonActionId): string {
  for (const beat of beats) {
    const match = beat.actions?.find((action) => action.id === actionId);
    if (match) return match.label;
  }
  return "the action you selected";
}
