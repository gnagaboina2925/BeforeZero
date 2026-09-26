import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  HOME_FIRE_BEATS,
  HOME_FIRE_GUIDED_BEAT_IDS,
  HOME_FIRE_PRACTICE_BEAT_IDS,
  homeFirePracticeFeedback,
} from "./home-fire.ts";
import { LESSON_SOURCES } from "./sources.ts";
import { createInitialLessonState, currentBeat, lessonReducer } from "./player.ts";

describe("home-fire lesson catalog", () => {
  it("stores a source id on every instructional beat", () => {
    for (const beat of HOME_FIRE_BEATS) {
      assert.ok(beat.sourceIds.length > 0, beat.id);
      for (const id of beat.sourceIds) {
        assert.equal(LESSON_SOURCES[id].id, id);
      }
    }
  });

  it("keeps this lesson in a one-story house and does not teach tornado or flood actions", () => {
    const intro = HOME_FIRE_BEATS.find((beat) => beat.id === "fire-intro");
    assert.match(intro?.happening ?? "", /not in a live fire/i);
    const joined = HOME_FIRE_BEATS.map((beat) => `${beat.whatToDo} ${beat.whatToAvoid} ${beat.narration}`).join(" ");
    assert.equal(/turn around|don’t drown|closed attic/i.test(joined), false);
    assert.match(joined, /not a tornado/i);
    assert.match(joined, /ground-floor bedroom/i);
  });

  it("teaches the plan and alarm before optional practice questions", () => {
    const guided = [...HOME_FIRE_GUIDED_BEAT_IDS];
    assert.ok(guided.indexOf("fire-prep") < guided.indexOf("fire-demo-plan"));
    assert.ok(guided.indexOf("fire-demo-plan") < guided.indexOf("fire-alarm"));
    assert.ok(guided.indexOf("fire-alarm") < guided.indexOf("fire-blocked"));
    assert.equal(guided.includes("fire-alarm-decision"), false);
    assert.equal(guided.includes("fire-blocked-decision"), false);
    const practice = [...HOME_FIRE_PRACTICE_BEAT_IDS];
    assert.ok(practice.indexOf("fire-alarm") < practice.indexOf("fire-alarm-decision"));
    assert.ok(practice.indexOf("fire-blocked") < practice.indexOf("fire-blocked-decision"));
  });

  it("rejects opening a hot door and mixing in tornado sheltering", () => {
    const hot = homeFirePracticeFeedback("fire-blocked-decision", "open-hot-door");
    assert.equal(hot.fits, "does-not-fit");
    assert.match(hot.explanation, /leave the door closed/i);
    assert.match(hot.explanation, /fictional diagram/i);
    assert.match(hot.explanation, /if neither labeled way is usable/i);
    assert.match(hot.recommended, /if neither way is usable/i);
    assert.equal(/verified safe alternative in a real home/.test(hot.explanation), true);
    const second = homeFirePracticeFeedback("fire-blocked-decision", "use-second-way");
    assert.equal(second.fits, "fits");
    assert.match(second.explanation, /when a second way out is usable/i);
    assert.match(second.explanation, /not a verified safe alternative in a real home/i);
    const trapped = homeFirePracticeFeedback("fire-blocked-decision", "stay-signal-911");
    assert.equal(trapped.fits, "fits");
    assert.match(trapped.explanation, /neither labeled way/i);
    const basement = homeFirePracticeFeedback("fire-alarm-decision", "go-basement-fire");
    assert.equal(basement.fits, "does-not-fit");
    assert.match(basement.explanation, /tornado/i);
  });
});

describe("home-fire lesson player", () => {
  it("plays guided teaching without stopping for a decision", () => {
    let state = createInitialLessonState("home-fire-1");
    state = lessonReducer(state, { type: "START", mode: "guided" });
    assert.equal(currentBeat(state)?.id, "fire-intro");
    for (let step = 0; step < 16; step += 1) {
      const before = state.beatIndex;
      state = lessonReducer(state, { type: "NEXT" });
      if (state.beatIndex === before) break;
      assert.notEqual(currentBeat(state)?.kind, "decision");
    }
    assert.equal(currentBeat(state)?.kind, "debrief");
  });

  it("teaches the diagram and alarm before the first practice question", () => {
    let state = createInitialLessonState("home-fire-1");
    state = lessonReducer(state, { type: "START", mode: "practice" });
    const seen: string[] = [];
    while (currentBeat(state)?.kind !== "decision") {
      seen.push(currentBeat(state)?.id ?? "");
      state = lessonReducer(state, { type: "NEXT" });
    }
    assert.ok(seen.includes("fire-prep"));
    assert.ok(seen.includes("fire-demo-plan"));
    assert.ok(seen.includes("fire-alarm"));
    assert.equal(currentBeat(state)?.id, "fire-alarm-decision");
  });
});
