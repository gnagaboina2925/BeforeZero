import type { LessonSourceId } from "./sources.ts";
export { LESSON_SOURCE_LINKS } from "./sources.ts";

export const LESSON_ID = "hurricane-flood-1";

export const LESSON_ACTION_IDS = [
  "stay-inside",
  "move-higher",
  "avoid-floodwater",
  "walk-through-water",
  "follow-officials",
  "highest-floor",
  "closed-attic",
  "wait-for-alerts",
] as const;
export type LessonActionId = (typeof LESSON_ACTION_IDS)[number];

export type LessonBeatKind = "play" | "decision" | "debrief";
export type LessonCondition = "before-storm" | "official-evac" | "high-winds" | "flood-waters" | "trapped-by-flooding";
export type LessonOverlayId = "none" | "alert-card" | "flooded-road" | "building-cutaway";
export type LessonSceneId = "watch" | "rain" | "street" | "interior" | "flood";

export interface LessonAction {
  id: LessonActionId;
  label: string;
}

export interface LessonBeat {
  id: string;
  kind: LessonBeatKind;
  title: string;
  caption: string;
  narration: string;
  scene: LessonSceneId;
  condition: LessonCondition | null;
  happening: string;
  whatToDo: string;
  whyItMatters: string;
  whatToAvoid: string;
  sourceIds: LessonSourceId[];
  overlay: LessonOverlayId;
  overlayDescription: string;
  prompt?: string;
  actions?: LessonAction[];
}

export const LESSON_STILL_LABEL =
  "Illustrated still fallback — not documentary footage, not your home, and not a generated video.";

export const GUIDED_BEAT_IDS = [
  "intro",
  "teach-prep",
  "demo-alerts",
  "teach-wind",
  "teach-street",
  "demo-street",
  "teach-indoor-flood",
  "demo-indoor",
  "debrief",
] as const;

export const PRACTICE_BEAT_IDS = [
  "intro",
  "teach-street",
  "demo-street",
  "rain-decision",
  "teach-indoor-flood",
  "demo-indoor",
  "flood-decision",
  "debrief",
] as const;

export const LESSON_TAKEAWAYS = [
  "Before a storm: set up several ways to get alerts, make a household plan, and follow local emergency managers — including if they tell you to evacuate.",
  "If flood water is on a road or street: do not walk, swim, or drive through it. Turn around. Don’t drown.",
  "If you are trapped by flooding inside a building: go to the highest level. Do not climb into a closed attic.",
] as const;

export const PREPARE_CHECKLIST = [
  {
    text: "Learn how rain, wind, water, and flooding can happen far inland, not only at the coast.",
    sourceId: "ready-hurricanes-inland" as LessonSourceId,
  },
  {
    text: "Make a household hurricane plan. Identify extra help now if anyone may need assistance during an emergency.",
    sourceId: "ready-hurricanes-plan-disability" as LessonSourceId,
  },
  {
    text: "Know your local evacuation zone and follow instructions from local emergency managers.",
    sourceId: "ready-hurricanes-evac-zone" as LessonSourceId,
  },
  {
    text: "Have several ways to receive alerts, including community alerts, EAS, and WEA. NOAA Weather Radio is another official channel.",
    sourceId: "ready-hurricanes-alerts" as LessonSourceId,
  },
  {
    text: "Gather household supplies, including medications and backup charging, before a storm arrives.",
    sourceId: "ready-hurricanes-plan" as LessonSourceId,
  },
] as const;

export const ACCESS_PREP_NOTE = {
  text: "This lesson does not assume everyone can hear, see a diagram, or use stairs. Ready.gov says to identify extra help before an emergency, create a support network, and ask your local emergency management office about voluntary assistance registries. This app cannot promise that help will arrive.",
  sourceIds: ["ready-hurricanes-plan-disability", "ready-disability-network", "ready-disability-registry"] as LessonSourceId[],
};

export const LESSON_BEATS: LessonBeat[] = [
  {
    id: "intro",
    kind: "play",
    title: "This is a teaching lesson",
    scene: "watch",
    condition: null,
    overlay: "none",
    overlayDescription: "",
    happening: "You are in BeforeZero, not in a live storm.",
    whatToDo: "Watch the guided explanations. Instruction is on this page.",
    whyItMatters: "You should not need an outside website to learn the actions in this lesson.",
    whatToAvoid: "Do not treat the pictures as a real place, route, or live warning.",
    sourceIds: ["ready-hurricanes-inland"],
    caption:
      "This is a teaching lesson inside BeforeZero. It is not a live storm. Ready.gov says hurricanes are not just a coastal problem. Rain, wind, water, and flooding can happen far inland.",
    narration:
      "This is a teaching lesson, not a live storm. Ready.gov says hurricanes are not just a coastal problem. Rain, wind, and flooding can happen far inland.",
  },
  {
    id: "teach-prep",
    kind: "play",
    title: "Before a storm: get ready to hear instructions",
    scene: "watch",
    condition: "before-storm",
    overlay: "none",
    overlayDescription: "",
    happening: "No storm is happening yet in this scene. This step is preparation.",
    whatToDo:
      "Make a household plan. Have several ways to receive alerts. Know that local emergency managers give evacuation instructions.",
    whyItMatters: "You may need to leave quickly, or you may need extra help that has to be arranged before a storm.",
    whatToAvoid:
      "Do not wait for this app to warn you. Do not mix this preparation step with wind sheltering or flood-water actions.",
    sourceIds: [
      "ready-hurricanes-plan",
      "ready-hurricanes-plan-disability",
      "ready-hurricanes-evac-zone",
      "ready-hurricanes-alerts",
      "ready-alerts-wea",
      "ready-alerts-eas",
      "ready-alerts-nwr",
    ],
    caption:
      "Condition: preparation before a storm. Ready.gov: make a household plan, and identify extra help if anyone may need it. Have several ways to get alerts, including community alerts, the Emergency Alert System, and Wireless Emergency Alerts. NOAA Weather Radio is another official channel. Follow local emergency managers. This app is not an alert service.",
    narration:
      "This step is preparation before a storm. Make a household plan. Identify extra help now if anyone may need it. Have more than one way to get alerts. Follow local emergency managers. This app will not warn you in a real storm.",
  },
  {
    id: "demo-alerts",
    kind: "play",
    title: "Demonstration: a fictional official instruction card",
    scene: "watch",
    condition: "before-storm",
    overlay: "alert-card",
    overlayDescription:
      "A labeled practice card shows a fictional, not-live alert. The important action highlighted on the card is: follow instructions from local emergency managers. Other lines list Wireless Emergency Alerts, the Emergency Alert System, and NOAA Weather Radio as ways to receive alerts. This is not a real Wireless Emergency Alert.",
    happening: "The picture behind the card is only weather scenery. The card is the demonstration.",
    whatToDo: "Read the highlighted line: follow local emergency managers.",
    whyItMatters: "Official instructions come from local alerting authorities, not from this website.",
    whatToAvoid: "Do not treat this card as a live warning for your city.",
    sourceIds: ["ready-hurricanes-alerts", "ready-hurricanes-evac-zone", "ready-alerts-wea", "ready-hurricanes-during-evac"],
    caption:
      "Demonstration: a fictional practice alert card, not a live warning. Highlighted action: follow local emergency managers. Ready.gov also says that if you live in a mandatory evacuation zone and local officials tell you to evacuate, do so immediately. That is a different situation from wind sheltering or flood water on a street.",
    narration:
      "This card is practice, not a live alert. The important action is to follow local emergency managers. If local officials tell you to evacuate, do that immediately. That instruction is separate from later flood-water steps.",
  },
  {
    id: "teach-wind",
    kind: "play",
    title: "A different situation: high winds",
    scene: "interior",
    condition: "high-winds",
    overlay: "none",
    overlayDescription: "",
    happening: "This step is only about high winds, not about flood water.",
    whatToDo: "Take refuge in a designated storm shelter or an interior room for high winds.",
    whyItMatters: "Wind protection and flood protection are not the same action.",
    whatToAvoid:
      "Do not use this wind advice when the problem is rising indoor flooding. Do not use it in place of an official evacuation order.",
    sourceIds: ["ready-hurricanes-during-wind", "ready-hurricanes-during-evac"],
    caption:
      "Condition: high winds, and you have not been ordered to evacuate. Ready.gov: take refuge in a designated storm shelter or an interior room for high winds. If local officials have told you to evacuate, that order comes first. This wind step is not advice for walking through water or for a closed attic.",
    narration:
      "This step is high winds only. If you have not been told to evacuate, take refuge in a designated storm shelter or an interior room. If officials told you to leave, that order comes first. This is not the flood-water action.",
  },
  {
    id: "teach-street",
    kind: "play",
    title: "Flood water on a street",
    scene: "street",
    condition: "flood-waters",
    overlay: "none",
    overlayDescription: "",
    happening: "In this practice scene, water is moving across a street. No official evacuation order is shown.",
    whatToDo: "Stay out of the water. Do not walk, swim, or drive through flood waters.",
    whyItMatters: "Just six inches of fast-moving water can knock a person down. One foot of moving water can sweep a vehicle away.",
    whatToAvoid: "Do not try to cross. Do not treat this as wind sheltering or as a building-flooding problem.",
    sourceIds: ["ready-hurricanes-during-tadd", "ready-floods-during-tadd", "ready-floods-warning"],
    caption:
      "Condition: flood water on a road or street. Ready.gov: do not walk, swim, or drive through flood waters. Turn Around. Don’t Drown. Just six inches of fast-moving water can knock you down, and one foot of moving water can sweep a vehicle away. This lesson does not invent a safe crossing.",
    narration:
      "Water is moving on a street in this practice scene. Do not walk, swim, or drive through flood waters. Turn around. Don’t drown. Six inches of fast-moving water can knock a person down.",
  },
  {
    id: "demo-street",
    kind: "play",
    title: "Demonstration: do not enter a flooded road",
    scene: "street",
    condition: "flood-waters",
    overlay: "flooded-road",
    overlayDescription:
      "A labeled training diagram shows a street with water across it and a large do-not-enter mark. Text reads: do not walk, swim, or drive through flood waters. A note says this is not a real street and not a route map.",
    happening: "The generated street clip is scenery. The diagram supplies the action.",
    whatToDo: "Stay out of the water and turn around.",
    whyItMatters: "Pictures of rain are not enough to teach the action. The overlay states it in words.",
    whatToAvoid: "Do not read a path through the picture. There is no safe crossing drawn here.",
    sourceIds: ["ready-hurricanes-during-tadd", "ready-floods-during-tadd"],
    caption:
      "Demonstration overlay, not a real street. The action is: do not enter the flood water. Ready.gov: Turn Around. Don’t Drown. This diagram is not an evacuation map.",
    narration:
      "This diagram is a training illustration, not a real road. The action is to stay out of the water. Do not walk through it. The picture is not a map.",
  },
  {
    id: "rain-decision",
    kind: "decision",
    title: "Practice: water is on the street",
    scene: "street",
    condition: "flood-waters",
    overlay: "flooded-road",
    overlayDescription:
      "The same flooded-road training diagram remains visible while you choose. It is not a live street.",
    happening: "Practice only. Water is still on the street. No official evacuation order is shown.",
    whatToDo: "Use what you just learned: stay out of the moving water.",
    whyItMatters: "Practice checks the idea after it was taught.",
    whatToAvoid: "Do not walk through the water. This is not a high-wind or attic question.",
    sourceIds: ["ready-hurricanes-during-tadd", "ready-floods-during-tadd"],
    caption:
      "Practice question for this street-flood scene only. Ready.gov: do not walk, swim, or drive through flood waters.",
    narration:
      "Practice question. Water is on the street. What do you do in this specific situation?",
    prompt: "What do you do in this practice scene, where water is moving on the street and no evacuation order is shown?",
    actions: [
      { id: "stay-inside", label: "Stay inside and keep listening for official alerts" },
      { id: "avoid-floodwater", label: "Stay out of the moving water and do not cross the street" },
      { id: "follow-officials", label: "Follow a local official instruction I already have" },
      { id: "walk-through-water", label: "Walk through the water to get somewhere else" },
    ],
  },
  {
    id: "teach-indoor-flood",
    kind: "play",
    title: "Rising water inside a building",
    scene: "flood",
    condition: "trapped-by-flooding",
    overlay: "none",
    overlayDescription: "",
    happening: "In this practice complication, water is entering a lower level. You are treated as trapped by flooding.",
    whatToDo: "Go to the highest level of the building. Do not climb into a closed attic.",
    whyItMatters: "A closed attic can trap a person as water rises. Ready.gov says to signal for help from the roof only if necessary.",
    whatToAvoid:
      "Do not mix this with the street-water rule or with high-wind interior-room sheltering. Do not assume stairs work for every person.",
    sourceIds: [
      "ready-hurricanes-during-flood-level",
      "ready-floods-during-highest",
      "ready-hurricanes-plan-disability",
      "ready-disability-network",
    ],
    caption:
      "Condition: trapped by flooding inside a building. Ready.gov: go to the highest level. Do not climb into a closed attic. You may become trapped by rising flood water. Only get on the roof if necessary and signal for help. Stairs may not be usable for everyone; identify extra help before a storm. This app cannot promise that help will arrive.",
    narration:
      "Water is entering a lower level in this practice scene. If you are trapped by flooding, go to the highest level. Do not climb into a closed attic. Stairs may not work for everyone. Plan extra help before a storm. This app cannot promise that help will arrive.",
  },
  {
    id: "demo-indoor",
    kind: "play",
    title: "Demonstration: building cutaway",
    scene: "interior",
    condition: "trapped-by-flooding",
    overlay: "building-cutaway",
    overlayDescription:
      "A conceptual cutaway of a fictional building. Lower floor marked as flooding. An arrow points to the highest occupied level. A closed attic is marked do not enter. A note says this is not a real building or evacuation map, and that stairs may be inaccessible.",
    happening: "The stair photo is scenery. The cutaway is the demonstration.",
    whatToDo: "Use the highest level, not a closed attic, if trapped by flooding.",
    whyItMatters: "The generated interior clip does not show a safe route. The overlay states the Ready.gov action in words.",
    whatToAvoid: "Do not copy a path from the picture. Do not treat the attic as shelter.",
    sourceIds: ["ready-hurricanes-during-flood-level", "ready-floods-during-highest", "ready-disability-network"],
    caption:
      "Demonstration overlay of a fictional building, not a real floor plan. If trapped by flooding: highest level. Not a closed attic. This is not an evacuation map.",
    narration:
      "This cutaway is a training illustration, not a real building. If trapped by flooding, go to the highest level. Do not use a closed attic. The picture is not a route.",
  },
  {
    id: "flood-decision",
    kind: "decision",
    title: "Practice: water is rising inside",
    scene: "interior",
    condition: "trapped-by-flooding",
    overlay: "building-cutaway",
    overlayDescription: "The same fictional building cutaway remains while you choose.",
    happening: "Practice only. Water is rising on a lower level. You are treated as trapped by flooding.",
    whatToDo: "Go to the highest level. Do not climb into a closed attic.",
    whyItMatters: "Practice checks the indoor flooding idea after it was taught.",
    whatToAvoid: "Do not answer this as a street-crossing or high-wind question.",
    sourceIds: ["ready-hurricanes-during-flood-level", "ready-floods-during-highest"],
    caption:
      "Practice question for indoor flooding only. Ready.gov: highest level if trapped by flooding. Not a closed attic.",
    narration: "Practice question. Water is rising in this building. What do you do in this specific situation?",
    prompt: "What do you do in this practice scene, where you are trapped by rising indoor flooding?",
    actions: [
      { id: "highest-floor", label: "Go to the highest level of the building, not a closed attic" },
      { id: "move-higher", label: "Move toward a higher floor if that is possible without entering flood water" },
      { id: "wait-for-alerts", label: "Only keep listening, without changing levels" },
      { id: "closed-attic", label: "Climb into a closed attic" },
    ],
  },
  {
    id: "debrief",
    kind: "debrief",
    title: "What you learned",
    scene: "watch",
    condition: null,
    overlay: "none",
    overlayDescription: "",
    happening: "The teaching scenes are finished.",
    whatToDo: "Review the three takeaways and the before-storm checklist on this page.",
    whyItMatters: "The lesson should leave you with the actions, not only with links.",
    whatToAvoid: "Do not treat this recap as a live all-clear or as a personal evacuation plan.",
    sourceIds: [
      "ready-hurricanes-alerts",
      "ready-hurricanes-during-tadd",
      "ready-hurricanes-during-flood-level",
    ],
    caption:
      "You can review the takeaways on this page. Pictures in this lesson are not evidence of a safe route.",
    narration:
      "The lesson is finished. Review what you learned, then the short before-storm checklist. Official links are extra reading, not a substitute for the teaching on this page.",
  },
];

export function isLessonActionId(value: string): value is LessonActionId {
  return (LESSON_ACTION_IDS as readonly string[]).includes(value);
}

export function beatById(id: string): LessonBeat | undefined {
  return LESSON_BEATS.find((beat) => beat.id === id);
}

export function beatsForMode(mode: "guided" | "practice"): LessonBeat[] {
  const ids = mode === "guided" ? GUIDED_BEAT_IDS : PRACTICE_BEAT_IDS;
  return ids.map((id) => beatById(id)).filter((beat): beat is LessonBeat => Boolean(beat));
}

export function conditionLabel(condition: LessonCondition | null): string | null {
  switch (condition) {
    case "before-storm":
      return "Condition: preparation before a storm";
    case "official-evac":
      return "Condition: official evacuation instruction";
    case "high-winds":
      return "Condition: high winds";
    case "flood-waters":
      return "Condition: flood water on a road or street";
    case "trapped-by-flooding":
      return "Condition: trapped by flooding inside a building";
    default:
      return null;
  }
}

export interface PracticeFeedback {
  chosen: string;
  fits: "fits" | "incomplete" | "does-not-fit";
  explanation: string;
  recommended: string;
  overlay: LessonOverlayId;
}

export function practiceFeedback(beatId: string, actionId: LessonActionId): PracticeFeedback {
  if (beatId === "rain-decision") {
    if (actionId === "walk-through-water") {
      return {
        chosen: "You chose to walk through the water to get somewhere else.",
        fits: "does-not-fit",
        explanation:
          "That does not fit this street-flood scene. Ready.gov says not to walk, swim, or drive through flood waters. Just six inches of fast-moving water can knock a person down.",
        recommended: "Stay out of the water. Turn around. Don’t drown. This lesson does not invent a safe crossing or a rescue.",
        overlay: "flooded-road",
      };
    }
    if (actionId === "follow-officials") {
      return {
        chosen: "You chose to follow a local official instruction you already have.",
        fits: "fits",
        explanation:
          "Following local officials fits Ready.gov. If officials tell you to evacuate, do that immediately. This practice scene did not show a live order, so keep that rule for a real alert from local managers, not from this app.",
        recommended: "Keep staying out of the flood water unless officials give a different, official instruction.",
        overlay: "flooded-road",
      };
    }
    return {
      chosen:
        actionId === "avoid-floodwater"
          ? "You chose to stay out of the moving water and not cross the street."
          : "You chose to stay inside and keep listening for official alerts.",
      fits: "fits",
      explanation:
        "That fits this scene: water is on the street and no evacuation order is shown. Ready.gov says not to walk, swim, or drive through flood waters.",
      recommended: "Stay out of the water and keep listening for local officials.",
      overlay: "flooded-road",
    };
  }
  if (actionId === "closed-attic") {
    return {
      chosen: "You chose to climb into a closed attic.",
      fits: "does-not-fit",
      explanation:
        "That does not fit this indoor flooding scene. Ready.gov says not to climb into a closed attic because you may become trapped by rising flood water.",
      recommended: "Go to the highest level of the building. Use the roof only if necessary and signal for help. This diagram is not a real floor plan.",
      overlay: "building-cutaway",
    };
  }
  if (actionId === "wait-for-alerts") {
    return {
      chosen: "You chose only to keep listening, without changing levels.",
      fits: "incomplete",
      explanation:
        "Listening for officials is part of staying informed. In this scene you are already trapped by flooding, so Ready.gov also says to go to the highest level of the building.",
      recommended: "Go to the highest level, not a closed attic, while you keep listening for local officials.",
      overlay: "building-cutaway",
    };
  }
  return {
    chosen:
      actionId === "move-higher"
        ? "You chose to move toward a higher floor without entering flood water."
        : "You chose to go to the highest level of the building, not a closed attic.",
    fits: "fits",
    explanation:
      "That fits this indoor flooding scene. Ready.gov: go to the highest level if trapped by flooding. Do not climb into a closed attic.",
    recommended: "Stay on the highest usable level. This app cannot name a real floor in a real building.",
    overlay: "building-cutaway",
  };
}

export function actionLabel(actionId: LessonActionId): string {
  for (const beat of LESSON_BEATS) {
    const match = beat.actions?.find((action) => action.id === actionId);
    if (match) return match.label;
  }
  return "the action you selected";
}
