import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { cueAtTime, mediaIdForBeat, narrationCues, narrationFingerprint, vttFromNarration, xmlSafeText } from "./media.ts";

describe("lesson media helpers", () => {
  it("maps beats to their own media ids", () => {
    assert.equal(mediaIdForBeat("demo-street"), "demo-street");
    assert.equal(mediaIdForBeat("teach-indoor-flood"), "teach-indoor-flood");
  });

  it("writes WebVTT from the teaching narration script", () => {
    const vtt = vttFromNarration("This is a teaching lesson, not a live storm. Ready.gov says hurricanes are not just a coastal problem.", 8);
    assert.match(vtt, /^WEBVTT/m);
    assert.match(vtt, /teaching lesson/i);
    assert.match(vtt, /--> /);
  });

  it("keeps timed cues aligned with the same narration script", () => {
    const cues = narrationCues("First sentence. Second sentence.", 8);
    assert.equal(cues.length, 2);
    assert.equal(cueAtTime(cues, 0.1), "First sentence.");
    assert.equal(cueAtTime(cues, cues[1].start + 0.05), "Second sentence.");
  });

  it("does not isolate dotted abbreviations such as U.S. as their own cues", () => {
    const cues = narrationCues(
      "This is a teaching lesson, not a live fire. The U.S. Fire Administration says people may have less than two minutes to get out after a smoke alarm sounds.",
      16.776,
    );
    assert.equal(
      cues.some((cue) => cue.text === "The U.S." || cue.text === "U.S."),
      false,
    );
    assert.ok(cues.some((cue) => /U\.S\. Fire Administration/.test(cue.text)));
    assert.equal(cues.at(-1)?.end, 16.776);
  });

  it("changes fingerprints when narration text changes", () => {
    assert.notEqual(narrationFingerprint("old script"), narrationFingerprint("new teaching script"));
  });

  it("strips XML-illegal control characters from SVG text", () => {
    const cleaned = xmlSafeText(`Instructional still \u0014 not a live sky & window`);
    assert.equal(cleaned.includes("\u0014"), false);
    assert.match(cleaned, /Instructional still  not a live sky &amp; window/);
  });
});
