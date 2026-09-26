import type {
  LessonActionId,
  LessonBeat,
  LessonOverlayId,
  PracticeFeedback,
} from "./catalog.ts";
import { TORNADO_SOURCE_LINKS, type LessonSourceId } from "./sources.ts";

export const TORNADO_LESSON_ID = "tornado-home-1";

export const TORNADO_SETTING =
  "This practice scene is a sturdy, site-built house with a basement. It is not a mobile home, vehicle, tent, or outdoor location.";

export const TORNADO_GUIDED_BEAT_IDS = [
  "tornado-intro",
  "tornado-watch-warning",
  "tornado-shelter-plan",
  "tornado-warning-home",
  "tornado-demo-shelter",
  "tornado-access",
  "tornado-debrief",
] as const;

export const TORNADO_PRACTICE_BEAT_IDS = [
  "tornado-intro",
  "tornado-watch-warning",
  "tornado-shelter-plan",
  "tornado-demo-shelter",
  "tornado-warning-decision",
  "tornado-access",
  "tornado-debrief",
] as const;

export const TORNADO_TAKEAWAYS = [
  "A tornado watch means be prepared. A tornado warning means take action. Do not wait for a color, a siren, or this website.",
  "In this lesson's sturdy house with a basement: go to an interior part of the basement, away from windows. Get under something sturdy if you can, and protect your head.",
  "Mobile homes, vehicles, and outdoor locations have different official guidance. This scene does not teach those as the same action.",
] as const;

export const TORNADO_PREPARE_CHECKLIST = [
  {
    text: "Know the words: tornado watch = be prepared; tornado warning = take action.",
    sourceId: "nws-tornado-watch" as LessonSourceId,
  },
  {
    text: "Before severe weather, pick a gathering place in this kind of sturdy home: interior basement, or an inside room without windows on the lowest floor if there is no basement.",
    sourceId: "cdc-tornado-home-basement" as LessonSourceId,
  },
  {
    text: "Have several ways to get alerts. NOAA Weather Radio, local news or TV, and a mobile phone are listed official channels. Do not rely on sirens or sound alone.",
    sourceId: "cdc-tornado-tuned" as LessonSourceId,
  },
  {
    text: "If anyone may need extra help, identify that help before severe weather. This app cannot promise that help will arrive.",
    sourceId: "ready-disability-network" as LessonSourceId,
  },
];

export const TORNADO_ACCESS_NOTE = {
  text: "This lesson does not assume everyone can hear a siren, see a diagram, climb stairs, or move without help. CDC guidance for a wheelchair is to get away from windows and go to an interior room, and if possible get under a sturdy table or desk and cover your head. If you cannot move from a bed or chair and assistance is not available, CDC says to cover up with blankets and pillows to protect from falling objects. Ready.gov says to create a support network before a disaster. This app cannot invent a rescue or promise that help will arrive.",
  sourceIds: [
    "cdc-tornado-wheelchair",
    "cdc-tornado-unable-to-move",
    "ready-disability-network",
  ] as LessonSourceId[],
};

export const TORNADO_SOURCE_LINKS_FOR_LESSON = TORNADO_SOURCE_LINKS;

export const TORNADO_BEATS: LessonBeat[] = [
  {
    id: "tornado-intro",
    kind: "play",
    title: "This is a teaching lesson",
    scene: "tornado-sky",
    condition: null,
    overlay: "none",
    overlayDescription: "",
    happening: "You are in BeforeZero, not in a live tornado.",
    whatToDo: "Watch the guided explanations. Instruction is on this page.",
    whyItMatters: "You should not need an outside website to learn the actions in this lesson.",
    whatToAvoid: "Do not treat the pictures as a live warning, your house, or a route map.",
    sourceIds: ["nws-tornado-watch", "nws-tornado-warning"],
    caption:
      "This is a teaching lesson inside BeforeZero. It is not a live tornado. The National Weather Service uses a tornado watch to mean be prepared and a tornado warning to mean take action. This lesson’s setting is a sturdy house with a basement, not a mobile home or a vehicle.",
    narration:
      "This is a teaching lesson, not a live tornado. A tornado watch means be prepared. A tornado warning means take action. This lesson is set in a sturdy house with a basement, not a mobile home or a car.",
  },
  {
    id: "tornado-watch-warning",
    kind: "play",
    title: "Watch versus warning",
    scene: "tornado-sky",
    condition: "tornado-watch",
    overlay: "tornado-alert-card",
    overlayDescription:
      "A labeled practice card. Left column titled Tornado Watch, subtitle Be prepared. Right column titled Tornado Warning, subtitle Take action. A note says this is not a live alert and that color and sound are not the only signals.",
    happening: "No tornado is happening in this scene. The card explains two official alert names.",
    whatToDo:
      "Treat a watch as time to review your plan. Treat a warning as a signal to take shelter in the way this lesson later shows for this sturdy home.",
    whyItMatters:
      "NWS: a watch means tornadoes are possible in a large area. A warning means a tornado has been sighted or indicated by radar, with imminent danger in a smaller area.",
    whatToAvoid:
      "Do not wait for a siren, a color on a map, or this app. CDC: sometimes a tornado arrives without time for a warning; take shelter if you see listed signs such as a rotating funnel-shaped cloud or an approaching cloud of debris.",
    sourceIds: [
      "nws-tornado-watch",
      "nws-tornado-warning",
      "nws-tornado-during-ready",
      "cdc-tornado-warning",
      "cdc-tornado-signs",
      "cdc-tornado-tuned",
    ],
    caption:
      "Condition: learning the alert names. NWS Tornado Watch: be prepared. Tornadoes are possible. Review plans and be ready if a warning is issued. NWS Tornado Warning: take action. A tornado has been sighted or indicated by radar. CDC: take shelter immediately during a tornado warning. Keep tuned to local radio or TV, NOAA Weather Radio, or a mobile phone. Color and sound are not the only signals.",
    narration:
      "A tornado watch means be prepared. Tornadoes are possible. Review your plan. A tornado warning means take action. A tornado has been sighted or shown on radar. Take shelter when a warning is issued. Do not wait for a siren or a color. Keep more than one way to get alerts.",
  },
  {
    id: "tornado-shelter-plan",
    kind: "play",
    title: "Prepare a shelter plan before severe weather",
    scene: "tornado-shelter",
    condition: "tornado-prepare",
    overlay: "none",
    overlayDescription: "",
    happening: "No warning is in effect yet. This step is planning for a sturdy house with a basement.",
    whatToDo:
      "Pick a gathering place now: the interior part of the basement, away from windows. If a home has no basement, CDC says to use an inside room without windows on the lowest floor, such as a center hallway, bathroom, or closet.",
    whyItMatters:
      "CDC: pick a place where family members can gather. One basic rule is avoid windows. Acting early during a watch helps you move when a warning is issued.",
    whatToAvoid:
      "Do not wait for a warning to choose a place. Do not plan to shelter in a mobile home. CDC: even tied-down mobile homes cannot withstand tornado winds. That is a different setting from this lesson.",
    sourceIds: [
      "nws-tornado-watch",
      "cdc-tornado-home-basement",
      "cdc-tornado-home-no-basement",
      "cdc-tornado-windows",
      "cdc-tornado-mobile-home",
      "ready-disability-network",
    ],
    caption:
      "Condition: plan before severe weather. NWS watch guidance: review emergency plans and check your safe room. CDC: the safest place in the home is the interior part of a basement. If there is no basement, go to an inside room without windows on the lowest floor. Avoid rooms with heavy objects on the floor above. This lesson’s house has a basement. A mobile home is not this setting.",
    narration:
      "Before severe weather, choose a shelter place. In a sturdy house, the interior of a basement is the safest place in the home. Stay away from windows. If a house has no basement, use an inside room without windows on the lowest floor. Do not plan to stay in a mobile home. That is a different setting.",
  },
  {
    id: "tornado-warning-home",
    kind: "play",
    title: "A fictional warning in this sturdy home",
    scene: "tornado-shelter",
    condition: "tornado-warning-home",
    overlay: "none",
    overlayDescription: "",
    happening: `${TORNADO_SETTING} A fictional tornado warning is in effect for this practice county. This is not a live alert.`,
    whatToDo:
      "Go to the interior part of the basement, away from windows. NWS: basement, safe room, or an interior room away from windows. CDC: get under something sturdy such as a heavy table if you can, and protect your head with anything available, even your hands.",
    whyItMatters:
      "NWS warning: imminent danger to life and property. CDC: exploding windows can injure or kill. This action is for this sturdy house, not for a car or a mobile home.",
    whatToAvoid:
      "Do not watch from a window. Do not try to outrun a tornado in a vehicle in this scene. You are already inside this house. Vehicle and mobile-home guidance is different and is not the action for this setting.",
    sourceIds: [
      "nws-tornado-warning",
      "nws-tornado-during-house",
      "cdc-tornado-warning",
      "cdc-tornado-home-basement",
      "cdc-tornado-windows",
      "cdc-tornado-cover",
      "cdc-tornado-vehicle",
    ],
    caption:
      "Condition: fictional tornado warning. You are inside a sturdy house with a basement. NWS: go to your basement, safe room, or an interior room away from windows. CDC: avoid windows; get under something sturdy if you can; protect your head. This is not a live warning and not a mobile home or vehicle scene.",
    narration:
      "Practice warning only. You are inside a sturdy house with a basement. Go to the interior of the basement, away from windows. Get under something sturdy if you can, and protect your head. Do not watch from a window. Do not try to outrun it in a car from this scene.",
  },
  {
    id: "tornado-demo-shelter",
    kind: "play",
    title: "Demonstration: labeled home diagram",
    scene: "tornado-shelter",
    condition: "tornado-warning-home",
    overlay: "tornado-home-shelter",
    overlayDescription:
      "A conceptual cutaway of a sturdy house with a basement. The interior basement is labeled: go here, away from windows. Windows on the upper floor are labeled: avoid windows. The attic is labeled: not the warning shelter in this lesson. A caption says this is not a mobile home, not a vehicle, and not a real floor plan.",
    happening: "The diagram states the action in words. It is not a photograph of a real house.",
    whatToDo: "Use the labeled basement interior, away from windows.",
    whyItMatters: "Pictures of weather are not enough. The overlay names the place in this sturdy home.",
    whatToAvoid: "Do not copy a path from the drawing. Do not treat an attic or a window room as the shelter for this warning.",
    sourceIds: ["nws-tornado-during-house", "cdc-tornado-home-basement", "cdc-tornado-windows"],
    caption:
      "Demonstration overlay of a fictional sturdy house, not a real floor plan. Interior basement: go here. Windows: avoid. Not a mobile home and not a vehicle.",
    narration:
      "This diagram is a training illustration, not a real house. In this sturdy home, go to the interior basement, away from windows. The picture is not a floor plan for your building.",
  },
  {
    id: "tornado-warning-decision",
    kind: "decision",
    title: "Practice: fictional warning in this house",
    scene: "tornado-shelter",
    condition: "tornado-warning-home",
    overlay: "tornado-home-shelter",
    overlayDescription: "The same sturdy-home cutaway remains while you choose. It is not a live warning.",
    happening: `${TORNADO_SETTING} Practice only. A fictional tornado warning is in effect.`,
    whatToDo: "Use what you just learned for this sturdy house with a basement.",
    whyItMatters: "Practice checks the idea after it was taught.",
    whatToAvoid: "Do not answer as if you were in a mobile home, a vehicle, or only under a watch.",
    sourceIds: ["nws-tornado-during-house", "cdc-tornado-home-basement", "cdc-tornado-windows", "cdc-tornado-vehicle"],
    caption:
      "Practice question for this sturdy house with a basement only. NWS: go to the basement or an interior room away from windows.",
    narration: "Practice question. A fictional tornado warning is in effect. You are inside this sturdy house with a basement. What do you do in this specific situation?",
    prompt:
      "A fictional tornado warning is in effect. You are inside this sturdy house with a basement. What do you do in this specific scene?",
    actions: [
      { id: "go-basement-interior", label: "Go to an interior part of the basement, away from windows" },
      { id: "watch-from-window", label: "Watch from a window so I can see the storm" },
      { id: "drive-away", label: "Leave in a vehicle to outrun the tornado" },
      { id: "stay-put-watch", label: "Stay where I am because a watch only means be aware" },
    ],
  },
  {
    id: "tornado-access",
    kind: "play",
    title: "Access considerations in this home",
    scene: "tornado-shelter",
    condition: "tornado-access",
    overlay: "none",
    overlayDescription: "",
    happening: "Same sturdy-house setting. This step is about access, not a new building type.",
    whatToDo:
      "If you use a wheelchair: CDC says get away from windows and go to an interior room; if possible, get under a sturdy table or desk and cover your head with anything available, even your hands. If you cannot move from a bed or chair and assistance is not available: CDC says cover up with blankets and pillows to protect from falling objects.",
    whyItMatters: "Stairs, hearing a siren, or seeing a video are not assumed. Official text still names a place to go and a way to protect your head.",
    whatToAvoid:
      "Do not treat this app as a dispatcher. Do not invent a carry procedure. Identify extra help before severe weather. This app cannot promise that help will arrive.",
    sourceIds: [
      "cdc-tornado-wheelchair",
      "cdc-tornado-unable-to-move",
      "cdc-tornado-cover",
      "ready-disability-network",
      "ready-disability-registry",
      "nws-tornado-during-ready",
    ],
    caption:
      "CDC: if you are in a wheelchair, get away from windows and go to an interior room of the house. If possible, seek shelter under a sturdy table or desk. Cover your head with anything available, even your hands. If you cannot move from a bed or chair and assistance is not available, cover up with blankets and pillows. Ready.gov: create a support network. This app cannot promise help.",
    narration:
      "This lesson does not assume you can use stairs, hear a siren, or see the picture. If you use a wheelchair, CDC says get away from windows and go to an interior room. If possible, get under a sturdy table and cover your head. If you cannot move and no one is there to help, cover with blankets and pillows. Plan extra help before severe weather. This app cannot promise that help will arrive.",
  },
  {
    id: "tornado-debrief",
    kind: "debrief",
    title: "What you learned",
    scene: "tornado-sky",
    condition: null,
    overlay: "none",
    overlayDescription: "",
    happening: "The teaching scenes are finished.",
    whatToDo: "Review the takeaways and the before-severe-weather checklist on this page. You can replay or use optional practice.",
    whyItMatters: "The lesson should leave you with the actions for this sturdy-home setting, not only with links.",
    whatToAvoid: "Do not treat this recap as a live all-clear, a universal rule for every building, or a personal shelter certificate.",
    sourceIds: ["nws-tornado-watch", "nws-tornado-warning", "nws-tornado-during-house", "cdc-tornado-home-basement"],
    caption:
      "You can review the takeaways on this page. Pictures in this lesson are not a real house or a live warning.",
    narration:
      "The lesson is finished. Review watch versus warning, the basement interior action for this sturdy home, and the access notes. Official links are extra reading, not a substitute for the teaching on this page.",
  },
];

export function tornadoBeatById(id: string): LessonBeat | undefined {
  return TORNADO_BEATS.find((beat) => beat.id === id);
}

export function tornadoBeatsForMode(mode: "guided" | "practice"): LessonBeat[] {
  const ids = mode === "guided" ? TORNADO_GUIDED_BEAT_IDS : TORNADO_PRACTICE_BEAT_IDS;
  return ids.map((id) => tornadoBeatById(id)).filter((beat): beat is LessonBeat => Boolean(beat));
}

export function tornadoPracticeFeedback(beatId: string, actionId: LessonActionId): PracticeFeedback {
  if (beatId !== "tornado-warning-decision") {
    return {
      chosen: "You chose an action.",
      fits: "incomplete",
      explanation: "That step is not a practice question in this tornado lesson.",
      recommended: "Use a listed action on the practice question for this sturdy house.",
      overlay: "tornado-home-shelter",
    };
  }
  if (actionId === "watch-from-window") {
    return {
      chosen: "You chose to watch from a window so you could see the storm.",
      fits: "does-not-fit",
      explanation:
        "That does not fit this warning in a sturdy house. CDC says to avoid windows. An exploding window can injure or kill. NWS: go to a basement, safe room, or interior room away from windows.",
      recommended: "Go to an interior part of the basement, away from windows.",
      overlay: "tornado-home-shelter",
    };
  }
  if (actionId === "drive-away") {
    return {
      chosen: "You chose to leave in a vehicle to outrun the tornado.",
      fits: "does-not-fit",
      explanation:
        "That does not fit this scene. You are already inside a sturdy house. CDC: do not try to outrun a tornado. NWS: being in a vehicle during a tornado is not safe. Vehicle guidance is a different setting.",
      recommended: "Stay in this house and go to an interior part of the basement, away from windows.",
      overlay: "tornado-home-shelter",
    };
  }
  if (actionId === "stay-put-watch") {
    return {
      chosen: "You chose to stay where you are because a watch only means be aware.",
      fits: "does-not-fit",
      explanation:
        "This practice scene is a warning, not only a watch. NWS: a warning means take action. CDC: take shelter immediately during a tornado warning.",
      recommended: "Treat the warning as take action: interior basement, away from windows.",
      overlay: "tornado-home-shelter",
    };
  }
  return {
    chosen: "You chose to go to an interior part of the basement, away from windows.",
    fits: "fits",
    explanation:
      "That fits this sturdy house with a basement. NWS: go to your basement or an interior room away from windows. CDC: the safest place in the home is the interior part of a basement.",
    recommended: "Get under something sturdy if you can, and protect your head. This diagram is not a real floor plan.",
    overlay: "tornado-home-shelter" satisfies LessonOverlayId,
  };
}
