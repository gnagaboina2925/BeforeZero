import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  ACCESS_PREP_NOTE,
  GUIDED_BEAT_IDS,
  LESSON_BEATS,
  LESSON_TAKEAWAYS,
  PRACTICE_BEAT_IDS,
  practiceFeedback,
} from "./catalog.ts";
import { LESSON_SOURCES } from "./sources.ts";

describe("hurricane lesson catalog", () => {
  it("stores a source id on every instructional beat", () => {
    for (const beat of LESSON_BEATS) {
      assert.ok(beat.sourceIds.length > 0, beat.id);
      for (const id of beat.sourceIds) {
        assert.equal(LESSON_SOURCES[id].id, id);
      }
    }
  });

  it("keeps street flooding, high winds, and indoor flooding in separate conditions", () => {
    const street = LESSON_BEATS.find((beat) => beat.id === "teach-street");
    const wind = LESSON_BEATS.find((beat) => beat.id === "teach-wind");
    const indoor = LESSON_BEATS.find((beat) => beat.id === "teach-indoor-flood");
    assert.equal(street?.condition, "flood-waters");
    assert.equal(wind?.condition, "high-winds");
    assert.equal(indoor?.condition, "trapped-by-flooding");
    assert.match(street?.whatToAvoid ?? "", /wind|attic/i);
    assert.match(wind?.whatToAvoid ?? "", /flood/i);
  });

  it("does not show raw action ids in takeaways and keeps a sourced assistance note", () => {
    const joined = LESSON_TAKEAWAYS.join(" ");
    assert.equal(/stay-inside|highest-floor|closed-attic/.test(joined), false);
    assert.match(ACCESS_PREP_NOTE.text, /cannot promise that help will arrive/i);
    assert.ok(GUIDED_BEAT_IDS.includes("demo-street"));
    assert.ok(PRACTICE_BEAT_IDS.includes("rain-decision"));
    assert.equal((GUIDED_BEAT_IDS as readonly string[]).includes("rain-decision"), false);
  });

  it("gives authored feedback for a walk-through-water answer", () => {
    const feedback = practiceFeedback("rain-decision", "walk-through-water");
    assert.equal(feedback.fits, "does-not-fit");
    assert.match(feedback.chosen, /walk through the water/i);
    assert.match(feedback.explanation, /not to walk/i);
    assert.equal(feedback.overlay, "flooded-road");
  });
});
