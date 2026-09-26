import type {
  LessonActionId,
  LessonBeat,
  LessonOverlayId,
  PracticeFeedback,
} from "./catalog.ts";
import { HOME_FIRE_SOURCE_LINKS, type LessonSourceId } from "./sources.ts";

export const HOME_FIRE_LESSON_ID = "home-fire-1";

export const HOME_FIRE_SETTING =
  "This practice scene is a fictional one-story house with a ground-floor bedroom. It is not your home, not a high-rise, not a tornado shelter drill, and not a flood scene.";

export const HOME_FIRE_GUIDED_BEAT_IDS = [
  "fire-intro",
  "fire-prep",
  "fire-demo-plan",
  "fire-alarm",
  "fire-blocked",
  "fire-outside",
  "fire-access",
  "fire-debrief",
] as const;

export const HOME_FIRE_PRACTICE_BEAT_IDS = [
  "fire-intro",
  "fire-prep",
  "fire-demo-plan",
  "fire-alarm",
  "fire-alarm-decision",
  "fire-blocked",
  "fire-blocked-decision",
  "fire-outside",
  "fire-access",
  "fire-debrief",
] as const;

export const HOME_FIRE_TAKEAWAYS = [
  "USFA: have working smoke alarms on every level, inside bedrooms, and outside sleeping areas; interconnect them; test monthly. Ready.gov: people who cannot hear a standard alarm can use vibrating pads or flashing lights.",
  "USFA: draw a home map, find two ways out of every room, keep exits unblocked, choose an outside meeting place in front of the home, and practice. Ready.gov: if a door is hot, keep it closed and use a second way out. If you cannot get out, close the door, cover vents and cracks, call 9-1-1, and signal at a window.",
  "Once outside, stay out and call 9-1-1. This app cannot promise assistance or certify a route in your building.",
] as const;

export const HOME_FIRE_PREPARE_CHECKLIST = [
  {
    text: "Install smoke alarms on every level, inside bedrooms, and outside sleeping areas. Interconnect them. Test every month. USFA: if you are deaf or hard of hearing, use alarms with a vibrating pad, flashing light, or strobe.",
    sourceId: "usfa-smoke-alarms" as LessonSourceId,
  },
  {
    text: "Draw a map of this kind of home. Include doors and windows. Find two ways out of every room. Keep those ways unblocked. Choose an outside meeting place in front of the home. Practice with everyone in the home.",
    sourceId: "usfa-escape-plans" as LessonSourceId,
  },
  {
    text: "If you use a walker or wheelchair, Ready.gov says to check that you can get through the doorways. USFA: if possible, live near an exit; ground floor is safer in an apartment; in a multistory home, sleep on the first floor. Arrange help before a fire. This app cannot promise that help will arrive.",
    sourceId: "usfa-fire-disability" as LessonSourceId,
  },
];

export const HOME_FIRE_ACCESS_NOTE = {
  text: "This lesson does not assume everyone can hear an alarm, see a diagram, crawl, or use stairs. USFA: deaf or hard-of-hearing residents can use smoke alarms with a vibrating pad, flashing light, or strobe. Ready.gov: audible alarms are listed for people who are visually impaired. Ready.gov: if you use a walker or wheelchair, check all exits to be sure you can get through the doorways. USFA: if possible live near an exit; you will be safest on the ground floor in an apartment; if you live in a multistory home, sleep on the first floor. Ready.gov: if you cannot get to someone needing assistance, leave and call 9-1-1 and tell the operator where the person is. This app cannot invent a rescue or promise that help will arrive.",
  sourceIds: [
    "usfa-fire-disability",
    "ready-home-fires-alarms",
    "ready-home-fires-plan",
    "ready-home-fires-during",
    "ready-disability-network",
  ] as LessonSourceId[],
};

export const HOME_FIRE_SOURCE_LINKS_FOR_LESSON = HOME_FIRE_SOURCE_LINKS;

export const HOME_FIRE_BEATS: LessonBeat[] = [
  {
    id: "fire-intro",
    kind: "play",
    title: "This is a teaching lesson",
    scene: "fire-room",
    condition: null,
    overlay: "none",
    overlayDescription: "",
    happening: "You are in BeforeZero, not in a live fire.",
    whatToDo: "Watch the guided explanations. Instruction is on this page.",
    whyItMatters: "USFA: residents could have less than two minutes to escape once a smoke alarm sounds.",
    whatToAvoid:
      "Do not treat the pictures as a live fire, your house, a certified route, or tornado or flood instructions.",
    sourceIds: ["usfa-escape-plans", "ready-home-fires-speed"],
    caption:
      "This is a teaching lesson inside BeforeZero. It is not a live fire. USFA: residents could have less than two minutes to escape a home fire once the smoke alarm sounds. This lesson’s setting is a fictional one-story house with a ground-floor bedroom.",
    narration:
      "This is a teaching lesson, not a live fire. The U.S. Fire Administration says people may have less than two minutes to get out after a smoke alarm sounds. This scene is a fictional one-story house with a ground-floor bedroom, not a tornado shelter and not a flood.",
  },
  {
    id: "fire-prep",
    kind: "play",
    title: "Prepare: alarms, a plan, and assistance",
    scene: "fire-room",
    condition: "fire-prepare",
    overlay: "none",
    overlayDescription: "",
    happening: "No fire is happening. This step is planning for a fictional one-story house.",
    whatToDo:
      "USFA: have smoke alarms on every level, inside bedrooms, and outside sleeping areas; interconnect them so when one sounds they all sound; test every month. Draw a map. Find two ways out of every room. Keep doors and windows unblocked. Choose an outside meeting place in front of the home. Practice with everyone. If anyone may need extra help, arrange that help before a fire.",
    whyItMatters:
      "Ready.gov: a working smoke alarm significantly increases chances of surviving a home fire. Escape plans help people get out quickly.",
    whatToAvoid:
      "Do not rely on sound alone. Do not wait until a fire to choose two ways out or a meeting place. Do not assume this app will send help.",
    sourceIds: [
      "usfa-smoke-alarms",
      "usfa-escape-plans",
      "usfa-fire-disability",
      "ready-home-fires-alarms",
      "ready-home-fires-plan",
    ],
    caption:
      "Condition: preparation. USFA smoke alarms: every level, inside bedrooms, outside sleeping areas; interconnect; test monthly. If deaf or hard of hearing: vibrating pad, flashing light, or strobe. USFA escape plans: map the home, two ways out of every room, unblocked exits, outside meeting place in front of the home, practice. Arrange assistance before a fire. This app cannot promise help.",
    narration:
      "Prepare before a fire. Put working smoke alarms on every level, inside bedrooms, and outside sleeping areas. Connect them so they all sound together. Test them every month. If you cannot hear a standard alarm, USFA lists vibrating pads, flashing lights, or strobes. Draw a map. Find two ways out of every room. Keep those ways clear. Pick a meeting place in front of the home. Practice. If someone may need extra help, arrange that help now. This app cannot promise that help will arrive.",
  },
  {
    id: "fire-demo-plan",
    kind: "play",
    title: "Demonstration: labeled escape plan",
    scene: "fire-room",
    condition: "fire-prepare",
    overlay: "fire-escape-plan",
    overlayDescription:
      "A conceptual plan of a fictional one-story house. Bedroom: you are here. Hallway door: first way out, labeled check the door before opening. Window: second way out for this house only. Front of house: outside meeting place. A note says this is not your floor plan, not a high-rise, and not a certified route.",
    happening: "The diagram states the plan in words. It is not a photograph of a real house.",
    whatToDo:
      "USFA: know two ways out of every room. In this fictional bedroom the labeled first way is the hallway door and the labeled second way is the window. The labeled meeting place is in front of this house.",
    whyItMatters: "Pictures of a room are not enough. The overlay names two ways out and a meeting place for this scene only.",
    whatToAvoid:
      "Do not copy a path from the drawing into your building. Do not treat a window as usable in every home. Ready.gov: make sure windows are not stuck and screens can come out; that check belongs to your real home, not this picture.",
    sourceIds: ["usfa-escape-plans", "ready-home-fires-plan"],
    caption:
      "Demonstration overlay of a fictional one-story house, not a real floor plan. Bedroom: you are here. Hallway door: first way out. Window: second way out in this lesson only. Front of house: outside meeting place. Not a certified route.",
    narration:
      "This diagram is a training illustration, not your house. USFA says find two ways out of every room. In this fictional bedroom the first labeled way is the hallway door. The second labeled way is the window. The meeting place is in front of this house. The picture is not a floor plan for your building.",
  },
  {
    id: "fire-alarm",
    kind: "play",
    title: "When an alarm warns you",
    scene: "fire-room",
    condition: "fire-alarm",
    overlay: "none",
    overlayDescription: "",
    happening: `${HOME_FIRE_SETTING} A fictional smoke-alarm warning is in effect. Sound is not the only signal.`,
    whatToDo:
      "Leave using a planned way out. Ready.gov: drop down and crawl low under smoke toward an exit if there is smoke, because heavy smoke and poisonous gases collect first along the ceiling. Before opening a door, feel the doorknob and door. USFA: get outside to your meeting place. Do not wait only for a sound you can hear.",
    whyItMatters:
      "USFA: you may have less than two minutes after the alarm. Ready.gov: smoke and toxic gases kill more people than flames. Ready.gov also lists vibrating pads or flashing lights for people who cannot hear a standard alarm.",
    whatToAvoid:
      "Do not go back inside for belongings. Do not hide. Do not treat this as a tornado basement action or a flood-water action. Do not assume everyone can crawl; if crawling is not possible, still use a planned way out and the access notes in this lesson.",
    sourceIds: [
      "usfa-escape-plans",
      "usfa-smoke-alarms",
      "ready-home-fires-during",
      "ready-home-fires-alarms",
      "ready-home-fires-speed",
    ],
    caption:
      "Condition: fictional smoke-alarm warning. Ready.gov: drop down and crawl low under smoke toward an exit if there is smoke. Feel the door before opening. USFA: get outside to the meeting place. Sound is not the only alarm signal. This is not a live fire.",
    narration:
      "Practice alarm only. Leave using a planned way out. If there is smoke, Ready.gov says get low and move under the smoke toward an exit. Feel the door before you open it. Get to the outside meeting place. Do not wait only for a sound. Do not go back inside. This is not a tornado or flood action.",
  },
  {
    id: "fire-alarm-decision",
    kind: "decision",
    title: "Practice: fictional alarm in this bedroom",
    scene: "fire-room",
    condition: "fire-alarm",
    overlay: "fire-escape-plan",
    overlayDescription: "The same fictional one-story plan remains while you choose. It is not a live fire.",
    happening: `${HOME_FIRE_SETTING} Practice only. A fictional smoke-alarm warning is in effect.`,
    whatToDo: "Use what you just learned for this ground-floor bedroom.",
    whyItMatters: "Practice checks the idea after it was taught.",
    whatToAvoid: "Do not answer as if this were a tornado warning or a flood.",
    sourceIds: ["ready-home-fires-during", "usfa-escape-plans", "ready-home-fires-alarms"],
    caption:
      "Practice question for this fictional one-story house. Ready.gov: get low under smoke if present and leave. USFA: go to the outside meeting place. Do not go back inside.",
    narration:
      "Practice question. A fictional smoke alarm is warning you in this ground-floor bedroom. What do you do in this specific situation?",
    prompt:
      "A fictional smoke alarm is warning you. You are in this ground-floor bedroom of a one-story house. What do you do?",
    actions: [
      { id: "leave-now-get-low", label: "Leave now using a planned way out. Get low if there is smoke." },
      { id: "wait-for-sound", label: "Stay until I personally hear a loud sound" },
      { id: "go-back-inside", label: "Go back for my phone and bag first" },
      { id: "go-basement-fire", label: "Go to the basement and stay away from windows" },
    ],
  },
  {
    id: "fire-blocked",
    kind: "play",
    title: "If the first way out is blocked",
    scene: "fire-room",
    condition: "fire-blocked",
    overlay: "fire-blocked-door",
    overlayDescription:
      "The same fictional plan with the hallway door labeled: hot or smoke around the door — keep closed. Window labeled: second way out on this diagram if that way is usable. A note says if neither labeled way is usable: close the door, cover vents and cracks, call 9-1-1, signal at a window. This diagram is not a verified exit in a real home.",
    happening: "Fictional complication: the hallway door of this bedroom feels hot, or smoke is coming around it.",
    whatToDo:
      "Ready.gov: if the doorknob or door is hot, or smoke is coming around the door, leave the door closed and use your second way out. On this fictional diagram, the window is labeled as that second way only if it is usable. This lesson does not verify a safe alternative in a real home. If neither labeled way is usable, Ready.gov: close the door, cover vents and cracks around doors with cloth or tape, call 9-1-1, say where you are, and signal at the window with a light-colored cloth or a flashlight.",
    whyItMatters: "Ready.gov: find two ways out of each room in case the primary way is blocked by fire or smoke.",
    whatToAvoid:
      "Do not open a hot door to check. Do not treat this overlay as proof that a window in your home is a safe exit. Do not stay without calling for help if you cannot get out.",
    sourceIds: ["ready-home-fires-during", "ready-home-fires-plan", "usfa-escape-plans"],
    caption:
      "Condition: fictional blocked or hot hallway door. Ready.gov: keep the hot door closed and use a second way out if that way is usable. This diagram labels a window as that way for this bedroom only. If neither labeled way is usable: close the door, cover vents and cracks, call 9-1-1, say where you are, signal at a window. Not a verified exit in a real home.",
    narration:
      "Fictional complication. The hallway door feels hot. Ready.gov says keep that door closed and use your second way out. In this house the diagram labels the window as that second way. If you cannot get out, close the door, cover vents and cracks, call 9-1-1, say where you are, and signal at a window. This picture does not certify a route in your home.",
  },
  {
    id: "fire-blocked-decision",
    kind: "decision",
    title: "Practice: hot door in this bedroom",
    scene: "fire-room",
    condition: "fire-blocked",
    overlay: "fire-blocked-door",
    overlayDescription: "The same blocked-door labels remain while you choose. It is not a live fire.",
    happening: `${HOME_FIRE_SETTING} Practice only. The hallway door feels hot.`,
    whatToDo: "Use the official actions just taught for a hot or smoked-around door.",
    whyItMatters: "A blocked first way is why USFA and Ready.gov teach two ways out, and a trapped-in-place action if you cannot leave.",
    whatToAvoid: "Do not open the hot door. Do not invent a hallway path this lesson did not label.",
    sourceIds: ["ready-home-fires-during", "ready-home-fires-plan"],
    caption:
      "Practice question. Ready.gov: hot door stays closed; use a second way out if that way is usable. On this fictional diagram, a window is labeled as that second way for this bedroom only. If neither labeled way is usable: close door, cover vents and cracks, call 9-1-1, signal at a window. This is not a verified exit in a real home.",
    narration:
      "Practice question. You are in this ground-floor bedroom. The hallway door feels hot. What do you do in this specific situation?",
    prompt:
      "You are in this ground-floor bedroom. The hallway door feels hot. What do you do in this specific scene?",
    actions: [
      { id: "use-second-way", label: "Keep this door closed and use the labeled second way out in this house if that way is usable" },
      { id: "open-hot-door", label: "Open the hot door to see if the hallway is clear" },
      { id: "stay-signal-911", label: "If I cannot get out: close the door, cover vents, call 9-1-1, and signal at the window" },
      { id: "stay-no-call", label: "Stay in the room and wait without calling for help" },
    ],
  },
  {
    id: "fire-outside",
    kind: "play",
    title: "Outside meeting place and next steps",
    scene: "fire-outside",
    condition: "fire-outside",
    overlay: "none",
    overlayDescription: "",
    happening: "Fictional escape is complete for this scene. You are outside this one-story house.",
    whatToDo:
      "USFA: get outside to your meeting place. Ready.gov: go to a meeting place a safe distance from the home, stay outside, and never go back inside. Call 9-1-1. If someone is still inside, tell the emergency operator where the person is. If pets are trapped, tell firefighters.",
    whyItMatters: "USFA high-rise note also says go to the outside meeting place and stay there, then call the fire department. The same stay-out and call steps apply after you leave this one-story house.",
    whatToAvoid:
      "Do not go back inside for belongings, phones, or pets. Ready.gov after a fire: do not re-enter until the fire department says the residence is safe.",
    sourceIds: ["usfa-escape-plans", "ready-home-fires-during", "ready-home-fires-after", "ready-home-fire-drill"],
    caption:
      "Condition: outside this fictional house. USFA: meeting place in front of the home. Stay out. Call 9-1-1. Tell operators if someone is still inside. Do not go back in. Ready.gov: check with the fire department before re-entering.",
    narration:
      "Get to the outside meeting place in front of this house and stay there. Call 9-1-1. If someone is still inside, tell the operator where they are. Do not go back in. The fire department says when a home is safe to enter. This app cannot send firefighters.",
  },
  {
    id: "fire-access",
    kind: "play",
    title: "Access considerations in this home",
    scene: "fire-room",
    condition: "fire-access",
    overlay: "none",
    overlayDescription: "",
    happening: "Same one-story setting. This step is about access, not a new building type.",
    whatToDo:
      "Plan signals that do not depend only on hearing. USFA: vibrating pad, flashing light, or strobe if you are deaf or hard of hearing. Ready.gov: audible alarms are listed for people who are visually impaired. If you use a walker or wheelchair, check doorways. Prefer a ground-floor room near an exit when you can. If you cannot crawl, still use a planned way out. If you cannot get out, use the trapped-in-place steps: closed door, covered vents, 9-1-1, window signal.",
    whyItMatters: "Hearing an alarm, seeing a diagram, crawling, or using stairs are not assumed.",
    whatToAvoid:
      "Do not treat this app as a dispatcher. Ready.gov: if you cannot get to someone who needs assistance, leave and call 9-1-1 and tell the operator where they are. This app cannot promise that help will arrive.",
    sourceIds: [
      "usfa-fire-disability",
      "ready-home-fires-alarms",
      "ready-home-fires-plan",
      "ready-home-fires-during",
      "ready-disability-network",
    ],
    caption:
      "USFA: vibrating pad, flashing light, or strobe if deaf or hard of hearing; live near an exit when possible; ground floor is safer in an apartment. Ready.gov: check doorways if you use a walker or wheelchair. If you cannot get to someone, leave and call 9-1-1. This app cannot promise help.",
    narration:
      "This lesson does not assume you can hear an alarm, see the diagram, crawl, or use stairs. USFA lists vibrating pads, flashing lights, or strobes if you cannot hear a standard alarm. Check that doorways work for a walker or wheelchair. Prefer a ground-floor room near an exit when you can. If you cannot get out, close the door, cover vents, call 9-1-1, and signal at a window. Plan extra help before a fire. This app cannot promise that help will arrive.",
  },
  {
    id: "fire-debrief",
    kind: "debrief",
    title: "What you learned",
    scene: "fire-outside",
    condition: null,
    overlay: "none",
    overlayDescription: "",
    happening: "The teaching scenes are finished.",
    whatToDo: "Review the takeaways and the printable preparation notes on this page. You can replay or use optional practice.",
    whyItMatters: "The lesson should leave you with sourced home-fire actions for this one-story setting, not tornado sheltering or flood instructions.",
    whatToAvoid: "Do not treat this recap as a live all-clear, a universal route certificate, or a promise of assistance.",
    sourceIds: ["usfa-escape-plans", "usfa-smoke-alarms", "ready-home-fires-during"],
    caption:
      "You can review the takeaways on this page. Pictures in this lesson are not a real house or a live fire.",
    narration:
      "The lesson is finished. Review working alarms, two ways out, the hot-door rule, the trapped-in-place steps, and the outside meeting place. Official links are extra reading, not a substitute for the teaching on this page.",
  },
];

export function homeFireBeatById(id: string): LessonBeat | undefined {
  return HOME_FIRE_BEATS.find((beat) => beat.id === id);
}

export function homeFireBeatsForMode(mode: "guided" | "practice"): LessonBeat[] {
  const ids = mode === "guided" ? HOME_FIRE_GUIDED_BEAT_IDS : HOME_FIRE_PRACTICE_BEAT_IDS;
  return ids.map((id) => homeFireBeatById(id)).filter((beat): beat is LessonBeat => Boolean(beat));
}

export function homeFirePracticeFeedback(beatId: string, actionId: LessonActionId): PracticeFeedback {
  if (beatId === "fire-alarm-decision") {
    if (actionId === "wait-for-sound") {
      return {
        chosen: "You chose to stay until you personally heard a loud sound.",
        fits: "does-not-fit",
        explanation:
          "Sound is not the only signal. USFA lists vibrating pads, flashing lights, or strobes if you are deaf or hard of hearing. Ready.gov also lists flashing or vibrating alarms. Leave using a planned way out when a working alarm warns you, including visual or tactile alarms.",
        recommended: "Leave now using a planned way out. Get low if there is smoke.",
        overlay: "fire-escape-plan",
      };
    }
    if (actionId === "go-back-inside") {
      return {
        chosen: "You chose to go back for a phone and bag first.",
        fits: "does-not-fit",
        explanation:
          "Ready.gov and USFA teach getting out and staying out. Going back inside for belongings is not the action for this alarm. Call 9-1-1 from outside.",
        recommended: "Leave now using a planned way out. Get low if there is smoke.",
        overlay: "fire-escape-plan",
      };
    }
    if (actionId === "go-basement-fire") {
      return {
        chosen: "You chose to go to the basement and stay away from windows.",
        fits: "does-not-fit",
        explanation:
          "That is tornado-style sheltering, not home-fire escape. USFA and Ready.gov teach leaving the home for a fire. This lesson is not a flood or tornado drill.",
        recommended: "Leave now using a planned way out. Get low if there is smoke.",
        overlay: "fire-escape-plan",
      };
    }
    return {
      chosen: "You chose to leave now using a planned way out and to get low if there is smoke.",
      fits: "fits",
      explanation:
        "That fits this fictional alarm. Ready.gov: crawl low under smoke toward an exit if there is smoke. USFA: get outside to your meeting place. Crawling is not assumed for everyone; the action is still to leave using a planned way.",
      recommended: "Feel the door before opening. Do not go back inside.",
      overlay: "fire-escape-plan" satisfies LessonOverlayId,
    };
  }
  if (beatId === "fire-blocked-decision") {
    if (actionId === "open-hot-door") {
      return {
        chosen: "You chose to open the hot door to check the hallway.",
        fits: "does-not-fit",
        explanation:
          "Ready.gov: if the doorknob or door is hot, or smoke is coming around the door, leave the door closed and use your second way out. On this fictional diagram, a window is labeled as that second way for this bedroom only, and only if it is usable. That label is not a verified safe alternative in a real home. If neither labeled way is usable, Ready.gov: close the door, cover vents and cracks around doors with cloth or tape, call 9-1-1, say where you are, and signal at the window.",
        recommended:
          "Keep this door closed. If the labeled window on this diagram is usable, use that second way. If neither way is usable, use the trapped-in-place steps.",
        overlay: "fire-blocked-door",
      };
    }
    if (actionId === "stay-no-call") {
      return {
        chosen: "You chose to stay in the room and wait without calling for help.",
        fits: "does-not-fit",
        explanation:
          "If you cannot get out, Ready.gov still says call 9-1-1, say where you are, and signal at a window. Waiting without calling is not that action.",
        recommended: "If you cannot get out: close the door, cover vents, call 9-1-1, and signal at the window.",
        overlay: "fire-blocked-door",
      };
    }
    if (actionId === "stay-signal-911") {
      return {
        chosen: "You chose the trapped-in-place steps: closed door, covered vents, 9-1-1, and a window signal.",
        fits: "fits",
        explanation:
          "That fits Ready.gov if you cannot get out, including when neither labeled way on this fictional diagram is usable. It does not replace using a second way out when that way is usable. This app does not certify that the labeled window is a verified exit in a real home.",
        recommended:
          "If the labeled window on this diagram is usable, keep the hot door closed and use that second way instead.",
        overlay: "fire-blocked-door",
      };
    }
    return {
      chosen: "You chose to keep the hot door closed and use the labeled second way out in this house if that way is usable.",
      fits: "fits",
      explanation:
        "That fits Ready.gov for a hot door when a second way out is usable. This fictional diagram labels a window as that second way in this bedroom only. It is not a verified safe alternative in a real home.",
      recommended:
        "If that labeled way is not usable, or neither exit is usable, use the trapped-in-place steps: close the door, cover vents, call 9-1-1, and signal at a window.",
      overlay: "fire-blocked-door" satisfies LessonOverlayId,
    };
  }
  return {
    chosen: "You chose an action.",
    fits: "incomplete",
    explanation: "That step is not a practice question in this home-fire lesson.",
    recommended: "Use a listed action on a practice question for this one-story house.",
    overlay: "fire-escape-plan",
  };
}
