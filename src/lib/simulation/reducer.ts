import {
  COMM_INTERRUPTION_LOG,
  FICTIONAL_TEXT_BODY,
  FLASHLIGHT_RETAINED_LOG,
  LOW_BATTERY_LOG,
  SCENE_META,
  SIM_ACTIONS,
  isSimActionId,
  permittedActionIds,
} from "./catalog.ts";
import { createInitialSimState, snapshotOf, stateFromSnapshot } from "./state.ts";
import type {
  SimActionId,
  SimEvent,
  SimHistoryEntry,
  SimLogEntry,
  SimMessage,
  SimSceneId,
  SimState,
} from "./types.ts";

let seq = 0;
function nextId(prefix: string): string {
  seq += 1;
  return `${prefix}-${seq}`;
}

export function resetSimIdsForTests(): void {
  seq = 0;
}

function pushLog(state: SimState, text: string): SimLogEntry[] {
  return [...state.eventLog, { id: nextId("log"), text }];
}

function pushHistory(state: SimState, actionId: SimActionId): SimHistoryEntry[] {
  return [
    ...state.history,
    {
      id: nextId("hist"),
      sceneId: state.sceneId,
      actionId,
      label: SIM_ACTIONS[actionId].label,
    },
  ];
}

function appendMessage(state: SimState, status: SimMessage["status"]): SimMessage[] {
  return [
    ...state.messages,
    {
      id: nextId("msg"),
      direction: "outgoing",
      text: FICTIONAL_TEXT_BODY,
      status,
    },
  ];
}

function isBackupAction(actionId: SimActionId): boolean {
  return SIM_ACTIONS[actionId].kind === "backup";
}

function applyOne(state: SimState, actionId: SimActionId): SimState {
  if (state.sceneId === "debrief") return state;
  if (!permittedActionIds(state.sceneId).includes(actionId)) {
    return {
      ...state,
      eventLog: pushLog(
        state,
        `That action is not available in this scene, so it was not applied.`,
      ),
    };
  }

  let next: SimState = {
    ...state,
    history: pushHistory(state, actionId),
  };

  switch (actionId) {
    case "phone-light": {
      next = {
        ...next,
        phoneUsedForLighting: true,
        lighting: next.flashlightReported && next.lighting === "flashlight" ? "flashlight" : "phone",
        eventLog: pushLog(
          next,
          next.flashlightReported && next.lighting === "flashlight"
            ? "You turned on a phone light. The flashlight already in use still lights the room."
            : "You turned on a phone flashlight. A small pool of light is shown in this practice scene.",
        ),
      };
      break;
    }
    case "flashlight": {
      next = {
        ...next,
        flashlightReported: true,
        lighting: "flashlight",
        eventLog: pushLog(
          next,
          "You reported a flashlight you already have. Room lighting in this scene no longer depends on the phone.",
        ),
      };
      break;
    }
    case "candles": {
      next = {
        ...next,
        candlesReported: true,
        lighting: next.lighting === "flashlight" ? "flashlight" : "candles",
        eventLog: pushLog(
          next,
          "You reported candles, matches, or a lighter. This records what you said. Ready.gov lists flashlights, not candles, for outage lighting.",
        ),
      };
      break;
    }
    case "look-for-supplies": {
      next = {
        ...next,
        kitLookedFor: true,
        eventLog: pushLog(
          next,
          "You looked for supplies in the apartment. Knowing a shelf is not a complete kit, and this practice does not invent what you found.",
        ),
      };
      break;
    }
    case "text-roommate":
    case "call-roommate":
    case "internet-message": {
      const blocked = next.network === "interrupted";
      const verb =
        actionId === "text-roommate"
          ? "text"
          : actionId === "call-roommate"
            ? "call"
            : "internet message";
      next = {
        ...next,
        phoneUsedForCommunication: true,
        messages: actionId === "call-roommate" ? next.messages : appendMessage(next, blocked ? "blocked" : "attempted"),
        eventLog: pushLog(
          next,
          blocked
            ? `You attempted a ${verb}. In this practice scene it does not go through. Delivery is not confirmed.`
            : `You attempted a fictional ${verb} to your roommate. Delivery is not confirmed.`,
        ),
      };
      break;
    }
    case "stay-put": {
      next = {
        ...next,
        eventLog: pushLog(next, "You chose to stay in the apartment for now."),
      };
      break;
    }
    case "another-device": {
      next = {
        ...next,
        chargedDeviceReported: true,
        backupActionId: "another-device",
        eventLog: pushLog(
          next,
          "You reported another charged device you already have. This practice does not confirm that it can send a message.",
        ),
      };
      break;
    }
    case "meeting-place": {
      next = {
        ...next,
        meetingPlaceReported: true,
        backupActionId: "meeting-place",
        eventLog: pushLog(
          next,
          "You reported a meeting place. Ready.gov describes a familiar place that is easy to find. This is not a direction to travel during an emergency.",
        ),
      };
      break;
    }
    case "unplanned-backup": {
      next = {
        ...next,
        backupActionId: "unplanned-backup",
        eventLog: pushLog(next, "You marked that a backup is still unplanned."),
      };
      break;
    }
    default:
      break;
  }

  if (isBackupAction(actionId)) {
    const attempt = { actionId, label: SIM_ACTIONS[actionId].label };
    if (!next.firstBackupAttempt) {
      next = { ...next, firstBackupAttempt: attempt };
    } else if (next.replayActive) {
      next = { ...next, revisedBackupAttempt: attempt };
    }
  }

  return next;
}

function introduceInterruption(state: SimState): SimState {
  let eventLog = pushLog(state, COMM_INTERRUPTION_LOG);
  let phoneBattery: SimState["phoneBattery"] = state.phoneBattery;
  let lowBatteryIntroduced = state.lowBatteryIntroduced;

  if (state.phoneUsedForLighting && state.phoneUsedForCommunication) {
    phoneBattery = "low";
    lowBatteryIntroduced = true;
    eventLog = [
      ...eventLog,
      { id: nextId("log"), text: LOW_BATTERY_LOG },
      {
        id: nextId("log"),
        text: "Lighting and communication both used this phone, so the backup should not depend on the same device. Battery level did not cause the network interruption.",
      },
    ];
  }

  if (state.flashlightReported && state.lighting === "flashlight") {
    eventLog = [...eventLog, { id: nextId("log"), text: FLASHLIGHT_RETAINED_LOG }];
  }

  return {
    ...state,
    sceneId: "interruption",
    elapsedLabel: SCENE_META.interruption.elapsedLabel,
    network: "interrupted",
    interruptionIntroduced: true,
    phoneBattery,
    lowBatteryIntroduced,
    eventLog,
  };
}

function advanceScene(state: SimState): SimState {
  if (state.sceneId === "lights-out") {
    const pre = snapshotOf(state);
    return introduceInterruption({
      ...state,
      preInterruption: pre,
    });
  }
  if (state.sceneId === "interruption") {
    return {
      ...state,
      sceneId: "backup",
      elapsedLabel: SCENE_META.backup.elapsedLabel,
      eventLog: pushLog(state, "The scenario moved to building a backup."),
    };
  }
  if (state.sceneId === "backup") {
    return {
      ...state,
      sceneId: "debrief",
      elapsedLabel: "Simulated time: practice paused",
      eventLog: pushLog(state, "Practice paused for debrief. These notes are not verified preparedness."),
    };
  }
  return state;
}

function replayTurningPoint(state: SimState): SimState {
  if (!state.preInterruption) return state;
  return stateFromSnapshot(state.preInterruption, {
    preInterruption: state.preInterruption,
    firstBackupAttempt: state.firstBackupAttempt,
    revisedBackupAttempt: null,
    replayActive: true,
  });
}

export function simulationReducer(state: SimState, event: SimEvent): SimState {
  switch (event.type) {
    case "RESTART":
      return createInitialSimState();
    case "REPLAY_TURNING_POINT":
      return replayTurningPoint(state);
    case "ADVANCE_SCENE":
      return advanceScene(state);
    case "APPLY_ACTIONS": {
      let next = state;
      for (const rawId of event.actionIds) {
        if (!isSimActionId(rawId)) {
          next = {
            ...next,
            eventLog: pushLog(next, "An unsupported action was ignored and was not remapped."),
          };
          continue;
        }
        next = applyOne(next, rawId);
      }
      return next;
    }
    default:
      return state;
  }
}

export function canAdvance(sceneId: SimSceneId): boolean {
  return sceneId === "lights-out" || sceneId === "interruption" || sceneId === "backup";
}

export function sceneTitle(sceneId: SimSceneId): string {
  if (sceneId === "debrief") return "Debrief";
  return SCENE_META[sceneId].title;
}

export function scenePrompt(sceneId: SimSceneId, state: SimState): string {
  if (sceneId === "debrief") {
    return "Review what you chose, what this scenario introduced, and what still needs planning.";
  }
  if (sceneId === "interruption" && state.flashlightReported && state.lighting === "flashlight") {
    return `${SCENE_META.interruption.prompt} A flashlight is still lighting the room.`;
  }
  return SCENE_META[sceneId].prompt;
}
