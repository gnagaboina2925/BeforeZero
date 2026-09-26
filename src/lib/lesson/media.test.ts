import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { cueAtTime, mediaIdForBeat, narrationCues, narrationFingerprint, vttFromNarration } from "./media.ts";

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

  it("changes fingerprints when narration text changes", () => {
    assert.notEqual(narrationFingerprint("old script"), narrationFingerprint("new teaching script"));
  });
});
