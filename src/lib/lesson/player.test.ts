import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { currentBeat, lessonReducer, createInitialLessonState } from "./player.ts";

describe("hurricane flood lesson player", () => {
  it("plays guided teaching without stopping for a decision", () => {
    let state = createInitialLessonState();
    state = lessonReducer(state, { type: "START", mode: "guided" });
    assert.equal(state.started, true);
    assert.equal(currentBeat(state)?.id, "intro");
    for (let step = 0; step < 12; step += 1) {
      const before = state.beatIndex;
      state = lessonReducer(state, { type: "NEXT" });
      if (state.beatIndex === before) break;
      assert.notEqual(currentBeat(state)?.kind, "decision");
    }
    assert.equal(currentBeat(state)?.kind, "debrief");
  });

  it("teaches the street concept before asking in practice mode", () => {
    let state = createInitialLessonState();
    state = lessonReducer(state, { type: "START", mode: "practice" });
    const seen: string[] = [];
    while (currentBeat(state)?.kind !== "decision") {
      seen.push(currentBeat(state)?.id ?? "");
      state = lessonReducer(state, { type: "NEXT" });
    }
    assert.ok(seen.includes("teach-street"));
    assert.ok(seen.includes("demo-street"));
    assert.equal(currentBeat(state)?.id, "rain-decision");
    state = lessonReducer(state, { type: "APPLY_DECISION", actionId: "walk-through-water" });
    assert.match(state.feedback["rain-decision"]?.chosen ?? "", /walk through the water/i);
    assert.equal(currentBeat(state)?.id, "rain-decision");
    state = lessonReducer(state, { type: "NEXT" });
    assert.equal(currentBeat(state)?.id, "teach-indoor-flood");
  });

  it("allows a retry without keeping the previous answer", () => {
    let state = createInitialLessonState();
    state = lessonReducer(state, { type: "START", mode: "practice" });
    while (currentBeat(state)?.id !== "rain-decision") {
      state = lessonReducer(state, { type: "NEXT" });
    }
    state = lessonReducer(state, { type: "APPLY_DECISION", actionId: "closed-attic" });
    state = lessonReducer(state, { type: "RETRY_DECISION" });
    assert.equal(state.decisions["rain-decision"], undefined);
    assert.equal(state.feedback["rain-decision"], undefined);
  });

  it("lets a learner open an earlier chapter without changing the teaching sequence", () => {
    let state = createInitialLessonState();
    state = lessonReducer(state, { type: "START", mode: "guided" });
    state = lessonReducer(state, { type: "NEXT" });
    state = lessonReducer(state, { type: "NEXT" });
    state = lessonReducer(state, { type: "GO_TO", index: 0 });
    assert.equal(currentBeat(state)?.id, "intro");
  });
});
