import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { summarizeSimulation } from "./debrief.ts";
import { resetSimIdsForTests, simulationReducer } from "./reducer.ts";
import { createInitialSimState } from "./state.ts";

function play(events: Parameters<typeof simulationReducer>[1][]) {
  resetSimIdsForTests();
  return events.reduce(simulationReducer, createInitialSimState());
}

describe("simulationReducer", () => {
  it("applies phone lighting and a text in one batch", () => {
    const state = play([
      { type: "APPLY_ACTIONS", actionIds: ["phone-light", "text-roommate"] },
    ]);
    assert.equal(state.lighting, "phone");
    assert.equal(state.phoneUsedForLighting, true);
    assert.equal(state.phoneUsedForCommunication, true);
    assert.equal(state.messages.length, 1);
    assert.equal(state.messages[0].status, "attempted");
    assert.equal(state.messages[0].direction, "outgoing");
  });

  it("does not remap an unsupported action into a listed one", () => {
    const state = play([
      { type: "APPLY_ACTIONS", actionIds: ["drive-to-hospital"] },
    ]);
    assert.equal(state.lighting, "none");
    assert.equal(state.history.length, 0);
    assert.ok(state.eventLog.some((item) => /unsupported/i.test(item.text)));
  });

  it("introduces a scripted interruption and low-battery event when the phone does both", () => {
    const state = play([
      { type: "APPLY_ACTIONS", actionIds: ["phone-light", "text-roommate"] },
      { type: "ADVANCE_SCENE" },
    ]);
    assert.equal(state.sceneId, "interruption");
    assert.equal(state.network, "interrupted");
    assert.equal(state.phoneBattery, "low");
    assert.equal(state.lowBatteryIntroduced, true);
    assert.ok(state.eventLog.some((item) => /not caused by battery/i.test(item.text)));
    assert.ok(state.eventLog.some((item) => /not a real battery reading/i.test(item.text)));
    assert.equal(state.preInterruption?.sceneId, "lights-out");
    assert.equal(state.preInterruption?.network, "ok");
  });

  it("keeps flashlight lighting when communication is interrupted", () => {
    const state = play([
      { type: "APPLY_ACTIONS", actionIds: ["flashlight", "text-roommate"] },
      { type: "ADVANCE_SCENE" },
    ]);
    assert.equal(state.lighting, "flashlight");
    assert.equal(state.flashlightReported, true);
    assert.equal(state.lowBatteryIntroduced, false);
    assert.equal(state.phoneBattery, "ok");
    assert.ok(state.eventLog.some((item) => /flashlight is already lighting/i.test(item.text)));
  });

  it("blocks a later text after the interruption without confirming delivery", () => {
    const state = play([
      { type: "APPLY_ACTIONS", actionIds: ["phone-light", "text-roommate"] },
      { type: "ADVANCE_SCENE" },
      { type: "APPLY_ACTIONS", actionIds: ["text-roommate"] },
    ]);
    assert.equal(state.messages.at(-1)?.status, "blocked");
    assert.ok(state.eventLog.some((item) => /does not go through/i.test(item.text)));
  });

  it("restores the pre-interruption snapshot on replay and keeps the first backup", () => {
    const interrupted = play([
      { type: "APPLY_ACTIONS", actionIds: ["phone-light", "text-roommate"] },
      { type: "ADVANCE_SCENE" },
      { type: "APPLY_ACTIONS", actionIds: ["meeting-place"] },
    ]);
    assert.equal(interrupted.firstBackupAttempt?.actionId, "meeting-place");

    const restored = simulationReducer(interrupted, { type: "REPLAY_TURNING_POINT" });
    assert.equal(restored.sceneId, "lights-out");
    assert.equal(restored.network, "ok");
    assert.equal(restored.lighting, "phone");
    assert.equal(restored.replayActive, true);
    assert.equal(restored.firstBackupAttempt?.actionId, "meeting-place");
    assert.equal(restored.revisedBackupAttempt, null);
    assert.equal(restored.backupActionId, null);

    const revised = playFrom(restored, [
      { type: "ADVANCE_SCENE" },
      { type: "APPLY_ACTIONS", actionIds: ["another-device"] },
    ]);
    assert.equal(revised.firstBackupAttempt?.actionId, "meeting-place");
    assert.equal(revised.revisedBackupAttempt?.actionId, "another-device");
    const notes = summarizeSimulation(revised);
    assert.match(notes.replayComparison ?? "", /First backup/);
    assert.match(notes.replayComparison ?? "", /Revised backup/);
  });

  it("does not invent resources when looking for supplies", () => {
    const state = play([{ type: "APPLY_ACTIONS", actionIds: ["look-for-supplies"] }]);
    assert.equal(state.kitLookedFor, true);
    assert.ok(state.eventLog.some((item) => /does not invent/i.test(item.text)));
  });
});

function playFrom(state: ReturnType<typeof createInitialSimState>, events: Parameters<typeof simulationReducer>[1][]) {
  return events.reduce(simulationReducer, state);
}
