import {
  CANDLE_FOLLOW_UP,
  FLASHLIGHT_FOLLOW_UP,
  KIT_LOCATION_FOLLOW_UP,
  MEETING_PLACE_FOLLOW_UP,
  PHONE_CONTACT_FOLLOW_UP,
  PHONE_LIGHT_FOLLOW_UP,
  UPDATES_FOLLOW_UP,
} from "../guidance.ts";
import type { SimActionId, SimSceneId } from "./types.ts";

export interface SimActionDef {
  id: SimActionId;
  label: string;
  kind: "lighting" | "communication" | "backup" | "supplies";
  hint?: string;
  scenes: SimSceneId[];
}

export const SIMULATION_LABEL = "Practice scenario — not a live outage.";

export const OPENING_PROMPT =
  "This is a practice scenario. The power has just gone out. Your roommate hasn't returned. Tell me what you do first.";

export const SCENE_META: Record<
  Exclude<SimSceneId, "debrief">,
  { title: string; prompt: string; elapsedLabel: string }
> = {
  "lights-out": {
    title: "The lights go out",
    prompt: OPENING_PROMPT,
    elapsedLabel: "Simulated time: just now",
  },
  interruption: {
    title: "Your first plan is interrupted",
    prompt:
      "In this practice scene, your first communication plan is interrupted. If lighting and messaging both used this phone, the scenario also treats the battery as low. What backup would you use?",
    elapsedLabel: "Simulated time: a short while later",
  },
  backup: {
    title: "Build a backup",
    prompt:
      "Choose a backup that does not depend on the same interrupted path. This is practice, not a direction to travel.",
    elapsedLabel: "Simulated time: still in the outage",
  },
};

export const FICTIONAL_TEXT_BODY =
  "Hey — the power just went out. Are you nearby?";

export const COMM_INTERRUPTION_LOG =
  "In this practice scene, calls and texts are delayed or unavailable. That interruption is scripted. It is not caused by battery level.";

export const LOW_BATTERY_LOG =
  "Scripted practice event: this phone was used for both lighting and communication, so the scenario now treats the battery as low. This is not a real battery reading or prediction.";

export const FLASHLIGHT_RETAINED_LOG =
  "A separate flashlight is already lighting the room, so lighting does not depend on the phone. Communication can still be interrupted.";

export const SIM_ACTIONS: Record<SimActionId, SimActionDef> = {
  "phone-light": {
    id: "phone-light",
    label: "Use the flashlight on my phone",
    kind: "lighting",
    hint: "Reported option. Ready.gov also recommends household flashlights.",
    scenes: ["lights-out"],
  },
  flashlight: {
    id: "flashlight",
    label: "Use a flashlight I already have",
    kind: "lighting",
    scenes: ["lights-out", "interruption", "backup"],
  },
  candles: {
    id: "candles",
    label: "Use candles, matches, or a lighter I already have",
    kind: "lighting",
    hint: "Reported option. Ready.gov power-outage guidance recommends flashlights, not candles.",
    scenes: ["lights-out"],
  },
  "look-for-supplies": {
    id: "look-for-supplies",
    label: "Look for supplies on household shelves",
    kind: "supplies",
    scenes: ["lights-out", "interruption", "backup"],
  },
  "text-roommate": {
    id: "text-roommate",
    label: "Text my roommate",
    kind: "communication",
    scenes: ["lights-out", "interruption"],
  },
  "call-roommate": {
    id: "call-roommate",
    label: "Call my roommate",
    kind: "communication",
    scenes: ["lights-out", "interruption"],
  },
  "internet-message": {
    id: "internet-message",
    label: "Send an internet message",
    kind: "communication",
    scenes: ["lights-out", "interruption"],
  },
  "stay-put": {
    id: "stay-put",
    label: "Stay here and wait",
    kind: "communication",
    scenes: ["lights-out", "interruption", "backup"],
  },
  "another-device": {
    id: "another-device",
    label: "Use another charged phone or device I already have",
    kind: "backup",
    scenes: ["interruption", "backup"],
  },
  "meeting-place": {
    id: "meeting-place",
    label:
      "An agreed meeting place, only if conditions allow and officials have not directed otherwise",
    kind: "backup",
    hint: "Ready.gov suggests a familiar meeting place. This is not a direction to travel during an emergency.",
    scenes: ["interruption", "backup"],
  },
  "unplanned-backup": {
    id: "unplanned-backup",
    label: "I haven't planned a backup yet",
    kind: "backup",
    scenes: ["interruption", "backup"],
  },
};

export function actionsForScene(sceneId: SimSceneId): SimActionDef[] {
  if (sceneId === "debrief") return [];
  return Object.values(SIM_ACTIONS).filter((action) => action.scenes.includes(sceneId));
}

export function isSimActionId(value: string): value is SimActionId {
  return Object.hasOwn(SIM_ACTIONS, value);
}

export function permittedActionIds(sceneId: SimSceneId): SimActionId[] {
  return actionsForScene(sceneId).map((action) => action.id);
}

export function followUpForAction(actionId: SimActionId): string | null {
  switch (actionId) {
    case "phone-light":
      return PHONE_LIGHT_FOLLOW_UP;
    case "flashlight":
      return FLASHLIGHT_FOLLOW_UP;
    case "candles":
      return CANDLE_FOLLOW_UP;
    case "look-for-supplies":
      return KIT_LOCATION_FOLLOW_UP;
    case "text-roommate":
    case "call-roommate":
    case "internet-message":
      return PHONE_CONTACT_FOLLOW_UP;
    case "meeting-place":
      return MEETING_PLACE_FOLLOW_UP;
    case "another-device":
      return UPDATES_FOLLOW_UP;
    default:
      return null;
  }
}
