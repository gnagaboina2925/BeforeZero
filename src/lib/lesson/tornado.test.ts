import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { TORNADO_BEATS, TORNADO_GUIDED_BEAT_IDS, tornadoPracticeFeedback } from "./tornado.ts";
import { LESSON_SOURCES } from "./sources.ts";
import { createInitialLessonState, currentBeat, lessonReducer } from "./player.ts";

describe("tornado lesson catalog", () => {
  it("stores a source id on every instructional beat", () => {
    for (const beat of TORNADO_BEATS) {
      assert.ok(beat.sourceIds.length > 0, beat.id);
      for (const id of beat.sourceIds) {
        assert.equal(LESSON_SOURCES[id].id, id);
      }
    }
  });

  it("keeps this lesson in a sturdy house with a basement and does not teach flood-water actions", () => {
    const warning = TORNADO_BEATS.find((beat) => beat.id === "tornado-warning-home");
    assert.match(warning?.happening ?? "", /sturdy, site-built house with a basement/i);
    const joined = TORNADO_BEATS.map((beat) => `${beat.whatToDo} ${beat.whatToAvoid}`).join(" ");
    assert.equal(/turn around|don’t drown|closed attic/i.test(joined), false);
    assert.match(joined, /mobile home/i);
  });

  it("teaches watch versus warning before the fictional warning", () => {
    const guided = [...TORNADO_GUIDED_BEAT_IDS];
    assert.ok(guided.indexOf("tornado-watch-warning") < guided.indexOf("tornado-warning-home"));
    assert.equal(guided.includes("tornado-warning-decision"), false);
  });

  it("rejects watching from a window during the practice warning", () => {
    const feedback = tornadoPracticeFeedback("tornado-warning-decision", "watch-from-window");
    assert.equal(feedback.fits, "does-not-fit");
    assert.match(feedback.explanation, /avoid windows/i);
  });
});

describe("tornado lesson player", () => {
  it("plays guided teaching without stopping for a decision", () => {
    let state = createInitialLessonState("tornado-home-1");
    state = lessonReducer(state, { type: "START", mode: "guided" });
    assert.equal(currentBeat(state)?.id, "tornado-intro");
    for (let step = 0; step < 12; step += 1) {
      const before = state.beatIndex;
      state = lessonReducer(state, { type: "NEXT" });
      if (state.beatIndex === before) break;
      assert.notEqual(currentBeat(state)?.kind, "decision");
    }
    assert.equal(currentBeat(state)?.kind, "debrief");
  });

  it("teaches the diagram before asking in practice mode", () => {
    let state = createInitialLessonState("tornado-home-1");
    state = lessonReducer(state, { type: "START", mode: "practice" });
    const seen: string[] = [];
    while (currentBeat(state)?.kind !== "decision") {
      seen.push(currentBeat(state)?.id ?? "");
      state = lessonReducer(state, { type: "NEXT" });
    }
    assert.ok(seen.includes("tornado-watch-warning"));
    assert.ok(seen.includes("tornado-demo-shelter"));
    assert.equal(currentBeat(state)?.id, "tornado-warning-decision");
  });
});
