import type { ComplicationCopy } from "./catalog.ts";

export const HOME_FIRE_PLAN_PROMPT =
  "In this one-story house with a ground-floor bedroom, how would you notice a fire, leave, and contact someone if you needed help?";

export const HOME_FIRE_PLAN_EXAMPLE = {
  label: "Labeled fictional example",
  text: "In this labeled example, Jordan has a smoke alarm they may not hear, would leave through the front door, and would call a neighbor named Pat. This is a fictional one-story house with a ground-floor bedroom, not a real household.",
};

export const HOME_FIRE_STEP_FREE_NOTE =
  "Step-free access: this rehearsal does not assume stairs, crawling, or carrying. Ready.gov says if you use a walker or wheelchair, check that you can get through doorways. This app does not invent a route or promise help.";

export const HOME_FIRE_COMPLICATIONS: Record<"alarm-perception" | "blocked-exit" | "support", ComplicationCopy> = {
  "alarm-perception": {
    kind: "alarm-perception",
    title: "Practice moment: the alarm signal you said you may not perceive",
    happening:
      "Fictional complication. You said in your own words that you may not perceive the alarm signal this plan relies on. This is not a live fire and not a diagnosis.",
    whatToDo:
      "USFA: put smoke alarms inside and outside each bedroom and on every level; interconnect them so when one sounds, they all sound. There are alarms for people with hearing loss that may have strobe lights that flash and/or vibrate. Test alarms every month. When you hear a smoke alarm, you may have less than 2 minutes to get outside. Ready.gov: audible alarms are available for visually impaired people, and alarms with a vibrating pad or flashing light are available for the hearing impaired. Do not wait only for a signal you said you may not perceive. This app does not diagnose hearing or vision.",
    whatToDoPlain:
      "Use interconnected smoke alarms. If you said you may not hear or see an alarm, USFA and Ready.gov describe strobe, flashing, vibrating, or audible options. Test monthly. You may have less than 2 minutes after a warning reaches you. This app does not diagnose anyone.",
    whyItMatters: "A plan that depends on a signal you said you may not perceive can fail even when an alarm is installed.",
    whatToAvoid:
      "Do not infer this complication from an accessibility preference alone. Do not treat this app as a fire alarm. Do not wait only for a signal you said you may not perceive.",
    caption:
      "Fictional rehearsal based on your words about perceiving an alarm. USFA: interconnected alarms; strobe or vibrating alarms for hearing loss; test monthly. Ready.gov: audible alarms for visual impairment. This is not a live fire.",
    narration:
      "This is a fictional rehearsal. You said you may not perceive the alarm this plan relies on. USFA says to use interconnected smoke alarms, and that strobe or vibrating alarms exist for people with hearing loss. Ready.gov also describes audible alarms for visual impairment. Test alarms every month. Do not wait only for a signal you said you may not perceive. This app is not a fire alarm and does not diagnose hearing or vision.",
    revisePrompt:
      "If you may not perceive that alarm signal, what official warning method would you use, without this app diagnosing you?",
    mediaBeatId: "fire-alarm",
    overlay: "none",
    sourceIds: ["usfa-smoke-alarms", "usfa-fire-disability", "ready-home-fires-alarms", "ready-home-fires-speed"],
    choices: [
      {
        id: "accessible-alarm",
        label: "I would use smoke alarms with a strobe, flashing light, or vibrating pad, and test them every month",
        fillsGap: true,
      },
      {
        id: "another-warn",
        label: "I would not wait only for a signal I said I may not perceive; I would also use another warning method I can perceive",
        fillsGap: true,
      },
      {
        id: "same-alarm-only",
        label: "I would keep relying only on the same alarm signal I already named",
        fillsGap: false,
      },
    ],
  },
  "blocked-exit": {
    kind: "blocked-exit",
    title: "Practice moment: a planned exit is blocked",
    happening:
      "Fictional complication. The exit you named cannot be used in this rehearsal. This is not a live fire and not a floor plan of your home.",
    whatToDo:
      "Before a fire: USFA says find 2 ways out of every room and make sure doors and windows are not blocked. Ready.gov: find two ways to get out of each room if the primary way is blocked; if you use a walker or wheelchair, check that you can get through doorways. This app does not name a specific second path for your home. During this fictional blocked-exit: Ready.gov says drop down and crawl low under smoke toward an exit if that is how you move; before opening a door, feel the doorknob and door; if either is hot, or if there is smoke around the door, leave the door closed and use your second way out. If you cannot get out, close the door, cover vents and cracks around doors with cloth or tape, call 9-1-1, say where you are, and signal at the window with a light-colored cloth or flashlight. Do not assume stairs or a window are usable unless you have already confirmed them. This app does not invent a route.",
    whatToDoPlain:
      "Plan two ways out of the room before a fire. This app will not pick a second path for you. If a door is hot, keep it closed and use your other planned way. If you cannot get out, close the door, call 9-1-1, and signal for help. Stairs and windows are not assumed.",
    whyItMatters: "One named door can be blocked by fire or smoke. Official guidance is a second way out, or stay-in-place steps if you cannot leave.",
    whatToAvoid:
      "Do not invent a safe route. Do not assume stairs or windows work. Do not plan on someone carrying you. Do not mix this with tornado sheltering or flood instructions.",
    caption:
      "Fictional rehearsal: the named exit cannot be used. USFA: two ways out; keep doors and windows unblocked. Ready.gov: feel the door; if hot, use the second way; if you cannot get out, close the door and call 9-1-1. The diagram is not a real floor plan.",
    narration:
      "This is a fictional rehearsal. The exit you named cannot be used. USFA says to find two ways out of every room and keep doors and windows unblocked. Ready.gov says to feel a door before opening it. If it is hot, keep it closed and use your second way out. If you cannot get out, close the door, call 9-1-1, and signal for help. This app does not invent a route and does not assume stairs or windows are usable.",
    revisePrompt: "If that named exit were blocked, what sourced action would you take, without this app inventing a route?",
    mediaBeatId: "fire-blocked",
    overlay: "fire-escape-plan",
    sourceIds: ["usfa-escape-plans", "ready-home-fires-plan", "ready-home-fires-during", "ready-home-fire-drill"],
    choices: [
      {
        id: "second-way-out",
        label: "I would use a second way out that I already planned, after checking whether a door is hot",
        fillsGap: true,
      },
      {
        id: "cannot-get-out",
        label: "If I cannot get out, I would close the door, call 9-1-1, and signal for help",
        fillsGap: true,
      },
      {
        id: "carry-or-invent",
        label: "I would have someone carry me, or I would invent a new route in this app",
        fillsGap: false,
      },
    ],
  },
  support: {
    kind: "support",
    title: "Practice moment: the planned support person is unavailable",
    happening:
      "Fictional complication. The person you named is not available in this rehearsal. This is not a live missing-person event.",
    whatToDo:
      "Ready.gov: create a support network of people who can help you in a disaster. Keep a contact list. Identify extra help before a fire if anyone may need it. During a fire, if you cannot get to someone needing assistance, leave the home and call 9-1-1 or the fire department. Tell the emergency operator where the person is located. This app cannot promise that help will arrive.",
    whatToDoPlain:
      "Plan more than one person who can help, before a fire. If you cannot reach someone during a fire, leave and call 9-1-1. Tell them where the person is. This app cannot send help.",
    whyItMatters: "One named person can be unavailable. Official fire guidance is to leave and call 9-1-1 if you cannot get to someone.",
    whatToAvoid: "Do not stay inside to search if you cannot reach someone. Do not treat this app as a dispatcher. Do not plan on being carried.",
    caption:
      "Fictional rehearsal: the named support person is unavailable. Ready.gov: a support network before a fire. If you cannot get to someone during a fire, leave and call 9-1-1. This app cannot promise help.",
    narration:
      "This is a fictional rehearsal. The person you named is not available. Ready.gov says to create a support network before a disaster. If you cannot get to someone during a fire, leave the home and call 9-1-1. Tell the operator where the person is. This app cannot promise that help will arrive.",
    revisePrompt: "If that person were unavailable, how would you still arrange contact before a fire, or what would you do if you could not reach them during one?",
    mediaBeatId: "fire-access",
    overlay: "none",
    sourceIds: ["ready-disability-network", "ready-disability-registry", "ready-home-fires-during"],
    choices: [
      {
        id: "second-contact",
        label: "I would name at least one other person in a support network and keep a contact list",
        fillsGap: true,
      },
      {
        id: "leave-and-call",
        label: "If I could not get to someone during a fire, I would leave and call 9-1-1",
        fillsGap: true,
      },
      {
        id: "same-person-only",
        label: "I would keep relying only on the same person I already named",
        fillsGap: false,
      },
    ],
  },
};
