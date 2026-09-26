import {
  CANDLE_FOLLOW_UP,
  MEETING_IF_SEPARATED_FOLLOW_UP,
  PHONE_LIGHT_FOLLOW_UP,
  SUPPLY_GAP_FOLLOW_UP,
  UPDATES_FOLLOW_UP,
} from "../guidance.ts";
import { SIM_ACTIONS, followUpForAction } from "./catalog.ts";
import type { SimDebrief, SimState } from "./types.ts";

export function summarizeSimulation(state: SimState): SimDebrief {
  const whatYouChose = state.history
    .filter((item) => item.sceneId === "lights-out")
    .map((item) => item.label);

  const whatScenarioIntroduced: string[] = [];
  if (state.interruptionIntroduced) {
    whatScenarioIntroduced.push(
      "Calls and texts were interrupted in this practice scene. That event is scripted and is not caused by battery level.",
    );
  }
  if (state.lowBatteryIntroduced) {
    whatScenarioIntroduced.push(
      "Because lighting and communication both used the phone, the scenario also introduced a scripted low-battery event. That is not a real battery reading.",
    );
  }
  if (state.flashlightReported && state.interruptionIntroduced) {
    whatScenarioIntroduced.push(
      "A reported flashlight continued to light the room, so lighting did not depend on the interrupted phone path.",
    );
  }
  if (whatScenarioIntroduced.length === 0) {
    whatScenarioIntroduced.push("No interruption had been introduced yet.");
  }

  const whatYouTriedNext = state.history
    .filter((item) => item.sceneId === "interruption" || item.sceneId === "backup")
    .map((item) => item.label);

  const still = new Set<string>();
  for (const item of state.history) {
    const followUp = followUpForAction(item.actionId);
    if (followUp) still.add(followUp);
  }
  if (state.candlesReported) still.add(CANDLE_FOLLOW_UP);
  if (state.phoneUsedForLighting) still.add(PHONE_LIGHT_FOLLOW_UP);
  if (!state.kitLookedFor) still.add(SUPPLY_GAP_FOLLOW_UP);
  if (state.meetingPlaceReported || state.backupActionId === "meeting-place") {
    still.add(MEETING_IF_SEPARATED_FOLLOW_UP);
  }
  if (state.backupActionId === "unplanned-backup" || !state.backupActionId) {
    still.add("Agree on a backup way to reconnect that does not depend on one phone.");
  }
  if (state.phoneUsedForCommunication) still.add(UPDATES_FOLLOW_UP);

  let replayComparison: string | null = null;
  if (state.firstBackupAttempt && state.revisedBackupAttempt) {
    if (state.firstBackupAttempt.actionId === state.revisedBackupAttempt.actionId) {
      replayComparison = `Your backup answer is unchanged: ${state.firstBackupAttempt.label}`;
    } else {
      replayComparison = `First backup: ${state.firstBackupAttempt.label}. Revised backup: ${state.revisedBackupAttempt.label}.`;
    }
  } else if (state.firstBackupAttempt && state.replayActive) {
    replayComparison = `First backup was ${state.firstBackupAttempt.label}. No revised backup has been applied yet.`;
  }

  return {
    whatYouChose: whatYouChose.length > 0 ? whatYouChose : ["No first-scene action was applied."],
    whatScenarioIntroduced,
    whatYouTriedNext:
      whatYouTriedNext.length > 0 ? whatYouTriedNext : ["No backup action was applied yet."],
    stillNeedsPlanning: [...still],
    replayComparison,
  };
}

export function backupLabel(state: SimState): string | null {
  if (!state.backupActionId) return null;
  return SIM_ACTIONS[state.backupActionId].label;
}
