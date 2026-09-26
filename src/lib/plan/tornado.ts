import type { ComplicationCopy } from "./catalog.ts";

export const TORNADO_PLAN_PROMPT =
  "Before severe weather, in this sturdy home with a basement, how would you receive a tornado watch or warning, contact someone, and reach the shelter you intend to use?";

export const TORNADO_PLAN_EXAMPLE = {
  label: "Labeled fictional example",
  text: "In this labeled example, Alex gets Wireless Emergency Alerts on a phone, texts a neighbor named Lee, and plans to shelter in the basement but has not arranged how they would get there. This is a sturdy house with a basement, not a mobile home or a vehicle. This is not a real household.",
};

export const TORNADO_STEP_FREE_NOTE =
  "Step-free access: this rehearsal does not assume stairs, crawling, or carrying. Arrange how you would reach the intended shelter before severe weather. This app cannot promise help and does not invent a route.";

export const TORNADO_COMPLICATIONS: Record<"communication" | "support" | "shelter-access", ComplicationCopy> = {
  communication: {
    kind: "communication",
    title: "Practice moment: the named alert method is unavailable",
    happening:
      "Fictional complication. The alert method you named is not working in this rehearsal. This is not a live outage and not a live tornado warning.",
    whatToDo:
      "NWS: continue to listen to local news or a NOAA Weather Radio to stay updated about tornado watches and warnings. CDC: keep tuned to local radio and TV stations, a NOAA weather radio, or your mobile phone. Ready.gov: Wireless Emergency Alerts and the Emergency Alert System require no sign-up. Have more than one official way to receive alerts. This app is not an alert service.",
    whatToDoPlain:
      "Have more than one official way to hear a watch or warning. NOAA Weather Radio, local news, Wireless Emergency Alerts, and the Emergency Alert System are official options. This app will not warn you.",
    whyItMatters: "One phone, app, or text path can fail. Official tornado alerts are not limited to a single device.",
    whatToAvoid:
      "Do not treat this website as a warning service. Do not invent a live warning for your area. This scene is a sturdy home, not a mobile home or vehicle.",
    caption:
      "Fictional rehearsal: the method you named cannot be used. NWS: NOAA Weather Radio or local news for watches and warnings. CDC: radio, TV, NOAA weather radio, or a mobile phone. Ready.gov: WEA and EAS need no sign-up.",
    narration:
      "This is a fictional rehearsal. The alert method you named is not working here. NWS says to keep listening to local news or a NOAA Weather Radio. CDC says to stay tuned to radio, TV, a NOAA weather radio, or a mobile phone. Ready.gov lists Wireless Emergency Alerts and the Emergency Alert System as official channels that do not need sign-up. This app will not warn you.",
    revisePrompt: "If that named method were unavailable, how would you still get a tornado watch or warning before severe weather?",
    mediaBeatId: "tornado-watch-warning",
    overlay: "tornado-alert-card",
    sourceIds: ["nws-tornado-during-ready", "cdc-tornado-tuned", "ready-alerts-wea", "ready-alerts-eas", "ready-alerts-nwr"],
    choices: [
      {
        id: "second-alert-channel",
        label: "I would also use another official channel such as NOAA Weather Radio, local news, WEA, or EAS",
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
      "Ready.gov: create a support network of people who can help you in a disaster. Keep a contact list. Identify extra help before severe weather if anyone may need it. Ask your local emergency management office about voluntary assistance registries. This app cannot promise that help will arrive.",
    whatToDoPlain:
      "Plan more than one person who can help. Keep their contact information. Ask local emergency management about voluntary registries. This app cannot send help.",
    whyItMatters: "One named person can be unavailable. Ready.gov treats a support network as preparation, not a guarantee.",
    whatToAvoid: "Do not treat a registry or this app as a promise that assistance will arrive. Do not plan on being carried.",
    caption:
      "Fictional rehearsal: the named support person cannot be reached. Ready.gov: a support network, a contact list, and optional local registries. This app cannot promise help.",
    narration:
      "This is a fictional rehearsal. The person you named cannot be reached here. Ready.gov says to create a support network and keep a contact list. Ask local emergency management about voluntary registries. This app cannot promise that help will arrive.",
    revisePrompt: "If that person could not be reached, how would you still arrange contact or extra help before severe weather?",
    mediaBeatId: "tornado-access",
    overlay: "none",
    sourceIds: ["ready-disability-network", "ready-disability-registry", "ready-disability-neighbors"],
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
  "shelter-access": {
    kind: "shelter-access",
    title: "Practice moment: access to the intended shelter is unresolved",
    happening:
      "Fictional complication. You named a shelter in this sturdy home, and how you would get there is still unresolved in this rehearsal. This is not a live warning.",
    whatToDo:
      "Before severe weather: decide the shelter place in this sturdy home (NWS: basement, safe room, or interior room away from windows; CDC: the interior part of a basement is the safest place in the home) and arrange how you would reach it, including extra help if you need it. This app cannot promise help and does not invent a route. Stairs and windows are not assumed. Do not plan on being carried. During a warning if you are already in this house: NWS says go to your basement, safe room, or an interior room away from windows. CDC wheelchair guidance: get away from windows and go to an interior room; if possible, seek shelter under a sturdy table or desk and cover your head. If you are unable to move from a bed or chair and assistance is not available: CDC says cover up with blankets and pillows. Those during-emergency actions do not finish the access arrangement you still need to make beforehand.",
    whatToDoPlain:
      "Before severe weather, pick the basement interior in this sturdy home and arrange how you would get there. This app cannot carry anyone or invent a path. If a warning happens and you cannot move and no one can help, CDC says cover with blankets and pillows. That is not the same as finishing the access plan.",
    whyItMatters:
      "Naming a basement is not the same as being able to reach it. Official guidance still names what to do in place if you cannot move and help is not there.",
    whatToAvoid:
      "Do not invent a route. Do not assume stairs or a window are usable. Do not plan on someone carrying you. Do not treat this app as a dispatcher. This is not a mobile home, vehicle, or flood scene.",
    caption:
      "Fictional rehearsal: how you would reach the named shelter is unresolved. Before weather: arrange access. During a warning in this house: NWS basement or interior room away from windows. If you cannot move and help is not available: CDC cover with blankets and pillows. This diagram is not a real floor plan.",
    narration:
      "This is a fictional rehearsal in a sturdy house with a basement. You named a shelter, and how you would get there is still unresolved. Before severe weather, arrange how you would reach that interior basement, including extra help if you need it. This app cannot promise help and does not invent a route. If a warning happens and you cannot move and assistance is not available, CDC says cover up with blankets and pillows. That during-emergency action does not finish the access arrangement.",
    revisePrompt:
      "How would you arrange reaching that shelter before severe weather, without this app inventing a route or promising help?",
    mediaBeatId: "tornado-demo-shelter",
    overlay: "tornado-home-shelter",
    sourceIds: [
      "nws-tornado-during-house",
      "cdc-tornado-home-basement",
      "cdc-tornado-wheelchair",
      "cdc-tornado-unable-to-move",
      "ready-disability-network",
    ],
    choices: [
      {
        id: "arrange-beforehand",
        label:
          "I would arrange how I would reach that shelter before severe weather, including extra help if needed, knowing this app cannot promise help",
        fillsGap: true,
      },
      {
        id: "during-cover-only",
        label:
          "If I could not move and assistance was not available, I would cover with blankets and pillows as CDC describes; that does not finish the access arrangement",
        fillsGap: false,
      },
      {
        id: "carry-or-invent",
        label: "I would have someone carry me, or I would invent a new route in this app",
        fillsGap: false,
      },
    ],
  },
};
