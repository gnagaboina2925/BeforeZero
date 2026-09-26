import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  filenameForAudioType,
  isAllowedAudioType,
  isStaleVoiceResult,
  MAX_VOICE_BYTES,
  parseSpeakRequest,
  parseVoiceContext,
  readTranscriptText,
  validateVoiceUpload,
} from "./voice.ts";

describe("validateVoiceUpload", () => {
  it("accepts a webm recording under 5 MB", () => {
    const result = validateVoiceUpload({
      size: 1024,
      type: "audio/webm;codecs=opus",
      name: "answer.webm",
    });
    assert.equal(result.ok, true);
  });

  it("rejects recordings over 5 MB", () => {
    const result = validateVoiceUpload({
      size: MAX_VOICE_BYTES + 1,
      type: "audio/webm",
      name: "answer.webm",
    });
    assert.equal(result.ok, false);
    if (result.ok) return;
    assert.match(result.message, /5 MB/);
  });

  it("rejects empty recordings", () => {
    const result = validateVoiceUpload({
      size: 0,
      type: "audio/webm",
      name: "answer.webm",
    });
    assert.equal(result.ok, false);
    if (result.ok) return;
    assert.match(result.message, /empty/i);
  });

  it("rejects unsupported types without a known extension", () => {
    const result = validateVoiceUpload({
      size: 2048,
      type: "application/pdf",
      name: "notes.pdf",
    });
    assert.equal(result.ok, false);
    if (result.ok) return;
    assert.match(result.message, /format/i);
  });

  it("allows a missing MIME type when the filename is a known audio extension", () => {
    const result = validateVoiceUpload({
      size: 2048,
      type: "",
      name: "answer.webm",
    });
    assert.equal(result.ok, true);
  });
});

describe("audio helpers", () => {
  it("normalizes codec suffixes as allowed webm", () => {
    assert.equal(isAllowedAudioType("audio/webm;codecs=opus"), true);
    assert.equal(isAllowedAudioType("text/plain"), false);
    assert.equal(filenameForAudioType("audio/mp4"), "answer.m4a");
  });

  it("treats blank or whitespace transcripts as empty", () => {
    assert.equal(readTranscriptText({ text: "  hello  " }), "hello");
    assert.equal(readTranscriptText({ text: "   " }), null);
    assert.equal(readTranscriptText({}), null);
    assert.equal(readTranscriptText(null), null);
  });
});

describe("parseVoiceContext", () => {
  it("resolves the question from household and step id", () => {
    const parsed = parseVoiceContext({
      household: "family",
      stepId: "lighting",
    });
    assert.equal(parsed.ok, true);
    if (!parsed.ok) return;
    assert.equal(parsed.question.stepId, "lighting");
    assert.match(parsed.question.prompt, /./);
  });

  it("uses prior contact answers for the comm backup question", () => {
    const parsed = parseVoiceContext({
      household: "roommates",
      stepId: "commBackup",
      priorAnswers: { contact: "phone" },
    });
    assert.equal(parsed.ok, true);
    if (!parsed.ok) return;
    assert.equal(parsed.question.stepId, "commBackup");
    assert.equal(parsed.question.id, "backup-phone");
    assert.equal(parsed.spokenText, parsed.question.prompt);
  });

  it("speaks the simulated phone-battery question when lighting and contact are phone-based", () => {
    const parsed = parseVoiceContext({
      household: "family",
      stepId: "commBackup",
      priorAnswers: { lighting: "phone-light", contact: "phone" },
    });
    assert.equal(parsed.ok, true);
    if (!parsed.ok) return;
    assert.equal(parsed.question.id, "backup-phone-battery");
    assert.match(parsed.spokenText, /Simulated practice event/);
    assert.match(parsed.spokenText, /phone battery is now nearly empty/);
    assert.equal(
      parsed.spokenText,
      `${parsed.question.eventNotice} ${parsed.question.prompt}`,
    );
  });

  it("rejects an unknown step", () => {
    const parsed = parseVoiceContext({
      household: "alone",
      stepId: "not-a-step",
    });
    assert.equal(parsed.ok, false);
  });

  it("speaks raw narration text for the simulation", () => {
    const parsed = parseSpeakRequest({
      text: "This is a practice scenario. The power has just gone out.",
    });
    assert.equal(parsed.ok, true);
    if (!parsed.ok) return;
    assert.match(parsed.spokenText, /practice scenario/);
  });
});

describe("stale voice results", () => {
  it("ignores transcription from a previous rehearsal step", () => {
    assert.equal(isStaleVoiceResult(1, 2), true);
    assert.equal(isStaleVoiceResult(4, 4), false);
  });
});
