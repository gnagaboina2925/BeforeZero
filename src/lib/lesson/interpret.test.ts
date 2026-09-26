import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { parseLessonInterpretRequest, sanitizeLessonInterpretation } from "./interpret.ts";

describe("lesson interpretation", () => {
  it("accepts a decision beat and drops unknown action ids", () => {
    const parsed = parseLessonInterpretRequest({
      utterance: "I will stay inside",
      beatId: "rain-decision",
    });
    assert.equal(parsed.ok, true);
    const proposal = sanitizeLessonInterpretation(
      {
        proposedActionIds: ["stay-inside", "teleport"],
        availability: "present",
        unsupportedNote: null,
        feedback: "You would stay inside.",
        clarification: null,
      },
      parsed.ok ? parsed.actionIds : [],
    );
    assert.deepEqual(proposal.proposedActionIds, ["stay-inside"]);
    assert.equal(proposal.clarification, null);
  });

  it("rejects non-decision beats", () => {
    assert.equal(parseLessonInterpretRequest({ utterance: "hello", beatId: "intro" }).ok, false);
  });
});
