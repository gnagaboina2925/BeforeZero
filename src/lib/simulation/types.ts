export const SIM_SCENE_IDS = ["lights-out", "interruption", "backup", "debrief"] as const;
export type SimSceneId = (typeof SIM_SCENE_IDS)[number];

export const LIGHTING_SOURCES = ["none", "phone", "flashlight", "candles", "searching"] as const;
export type LightingSource = (typeof LIGHTING_SOURCES)[number];

export const SIM_ACTION_IDS = [
  "phone-light",
  "flashlight",
  "candles",
  "look-for-supplies",
  "text-roommate",
  "call-roommate",
  "internet-message",
  "stay-put",
  "another-device",
  "meeting-place",
  "unplanned-backup",
] as const;
export type SimActionId = (typeof SIM_ACTION_IDS)[number];

export type SimAvailability = "present" | "intention" | "mixed" | "unknown";

export interface SimMessage {
  id: string;
  direction: "outgoing";
  text: string;
  status: "attempted" | "blocked";
}

export interface SimLogEntry {
  id: string;
  text: string;
}

export interface SimHistoryEntry {
  id: string;
  sceneId: SimSceneId;
  actionId: SimActionId;
  label: string;
}

export interface SimBackupAttempt {
  actionId: SimActionId;
  label: string;
}

export interface SimSnapshot {
  sceneId: SimSceneId;
  elapsedLabel: string;
  lighting: LightingSource;
  phoneUsedForLighting: boolean;
  phoneUsedForCommunication: boolean;
  flashlightReported: boolean;
  candlesReported: boolean;
  chargedDeviceReported: boolean;
  meetingPlaceReported: boolean;
  kitLookedFor: boolean;
  network: "ok" | "interrupted";
  phoneBattery: "ok" | "low";
  messages: SimMessage[];
  eventLog: SimLogEntry[];
  history: SimHistoryEntry[];
  interruptionIntroduced: boolean;
  lowBatteryIntroduced: boolean;
  backupActionId: SimActionId | null;
}

export interface SimState extends SimSnapshot {
  preInterruption: SimSnapshot | null;
  firstBackupAttempt: SimBackupAttempt | null;
  revisedBackupAttempt: SimBackupAttempt | null;
  replayActive: boolean;
}

export type SimEvent =
  | { type: "APPLY_ACTIONS"; actionIds: string[] }
  | { type: "ADVANCE_SCENE" }
  | { type: "RESTART" }
  | { type: "REPLAY_TURNING_POINT" };

export interface SimActionProposal {
  proposedActionIds: SimActionId[];
  droppedIds: string[];
  availability: SimAvailability;
  unsupportedNote: string | null;
  feedback: string;
  clarification: string | null;
}

export interface SimDebrief {
  whatYouChose: string[];
  whatScenarioIntroduced: string[];
  whatYouTriedNext: string[];
  stillNeedsPlanning: string[];
  replayComparison: string | null;
}
