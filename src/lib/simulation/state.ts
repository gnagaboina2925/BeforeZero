import { SCENE_META } from "./catalog.ts";
import type { SimSnapshot, SimState } from "./types.ts";

export function createInitialSimState(): SimState {
  return {
    sceneId: "lights-out",
    elapsedLabel: SCENE_META["lights-out"].elapsedLabel,
    lighting: "none",
    phoneUsedForLighting: false,
    phoneUsedForCommunication: false,
    flashlightReported: false,
    candlesReported: false,
    chargedDeviceReported: false,
    meetingPlaceReported: false,
    kitLookedFor: false,
    network: "ok",
    phoneBattery: "ok",
    messages: [],
    eventLog: [
      {
        id: "log-start",
        text: "Practice started. The apartment lights are out. This is not a live emergency.",
      },
    ],
    history: [],
    interruptionIntroduced: false,
    lowBatteryIntroduced: false,
    backupActionId: null,
    preInterruption: null,
    firstBackupAttempt: null,
    revisedBackupAttempt: null,
    replayActive: false,
  };
}

export function snapshotOf(state: SimState): SimSnapshot {
  return {
    sceneId: state.sceneId,
    elapsedLabel: state.elapsedLabel,
    lighting: state.lighting,
    phoneUsedForLighting: state.phoneUsedForLighting,
    phoneUsedForCommunication: state.phoneUsedForCommunication,
    flashlightReported: state.flashlightReported,
    candlesReported: state.candlesReported,
    chargedDeviceReported: state.chargedDeviceReported,
    meetingPlaceReported: state.meetingPlaceReported,
    kitLookedFor: state.kitLookedFor,
    network: state.network,
    phoneBattery: state.phoneBattery,
    messages: state.messages.map((item) => ({ ...item })),
    eventLog: state.eventLog.map((item) => ({ ...item })),
    history: state.history.map((item) => ({ ...item })),
    interruptionIntroduced: state.interruptionIntroduced,
    lowBatteryIntroduced: state.lowBatteryIntroduced,
    backupActionId: state.backupActionId,
  };
}

export function stateFromSnapshot(snapshot: SimSnapshot, extras: Partial<SimState> = {}): SimState {
  return {
    ...snapshot,
    messages: snapshot.messages.map((item) => ({ ...item })),
    eventLog: snapshot.eventLog.map((item) => ({ ...item })),
    history: snapshot.history.map((item) => ({ ...item })),
    preInterruption: extras.preInterruption ?? null,
    firstBackupAttempt: extras.firstBackupAttempt ?? null,
    revisedBackupAttempt: extras.revisedBackupAttempt ?? null,
    replayActive: extras.replayActive ?? false,
  };
}
