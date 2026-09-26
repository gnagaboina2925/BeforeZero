import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { CANDLE_FOLLOW_UP, PHONE_LIGHT_FOLLOW_UP, KIT_LOCATION_FOLLOW_UP } from "./guidance.ts";
import { compareBackupRetry, evaluateRehearsal } from "./evaluate.ts";

const completePhoneDependent = {
  lighting: "phone-light",
  contact: "phone",
  commBackup: "unplanned",
  supplies: "known-kit",
  openDetail: "updates",
};

describe("evaluateRehearsal revealed notes", () => {
  it("explains phone-dependent lighting and communication", () => {
    const results = evaluateRehearsal("alone", completePhoneDependent);
    assert.equal(results.phoneDependent, true);
    assert.equal(results.backupIdentified, false);
    assert.equal(results.backupUnanswered, true);
    assert.match(results.backupLabel ?? "", /haven't planned/i);
  });

  it("records living-alone contact wording in results", () => {
    const results = evaluateRehearsal("alone", completePhoneDependent);
    const contact = results.recorded.find((item) => item.stepId === "contact");
    assert.equal(contact?.questionTitle, "Contacting someone you trust");
    const supplies = results.recorded.find((item) => item.stepId === "supplies");
    assert.match(supplies?.choice.label ?? "", /I keep/);
  });

  it("keeps a non-phone lighting branch from the battery complication", () => {
    const results = evaluateRehearsal("family", {
      lighting: "known-flashlight",
      contact: "phone",
      commBackup: "meeting-place",
      supplies: "cabinets",
      openDetail: "updates",
    });
    assert.equal(results.phoneDependent, false);
    assert.equal(results.backupIdentified, true);
  });
});

describe("meeting-place backup with unresolved meeting location", () => {
  const conflicting = {
    lighting: "known-flashlight",
    contact: "phone",
    commBackup: "meeting-place",
    supplies: "cabinets",
    openDetail: "meeting-if-separated",
  };

  it("keeps both answers but does not treat the meeting arrangement as completed", () => {
    const results = evaluateRehearsal("family", conflicting);
    const historyBackup = results.recorded.find((item) => item.stepId === "commBackup");
    const historyMeeting = results.recorded.find((item) => item.stepId === "openDetail");
    assert.equal(historyBackup?.choice.id, "meeting-place");
    assert.equal(historyMeeting?.choice.id, "meeting-if-separated");
    assert.equal(results.meetingLocationUnresolved, true);
    assert.equal(results.backupIdentified, false);
    assert.equal(results.backupStatusLine, "Backup approach selected; meeting location still unresolved");
    assert.match(results.meetingConflictNote ?? "", /unresolved/);
    assert.match(results.meetingConflictNote ?? "", /officials have not directed otherwise/);
    assert.equal(
      results.plansIdentified.some((item) => item.choice.id === "meeting-place"),
      false,
    );
    assert.ok(results.detailsToPrepare.some((item) => item.choice.id === "meeting-if-separated"));
    assert.ok(results.detailsToPrepare.some((item) => /meeting place/i.test(item.task)));
  });

  it("keeps retry labels without saying the meeting gap is fully resolved", () => {
    const comparison = compareBackupRetry(
      "family",
      { ...conflicting, commBackup: "unplanned" },
      conflicting,
    );
    assert.match(comparison.firstLabel, /haven't planned/i);
    assert.match(comparison.revisedLabel, /agreed meeting place/i);
    assert.equal(comparison.gapFullyResolved, false);
    assert.equal(comparison.revisedIdentified, false);
    assert.equal(comparison.summary, "Backup approach selected; meeting location still unresolved");
    assert.doesNotMatch(comparison.summary, /Backup identified in practice/);
  });
});

describe("targeted backup retry", () => {
  it("reports a previously unanswered backup that is now identified", () => {
    const comparison = compareBackupRetry(
      "alone",
      completePhoneDependent,
      { ...completePhoneDependent, commBackup: "meeting-place" },
    );
    assert.equal(comparison.firstIdentified, false);
    assert.equal(comparison.revisedIdentified, true);
    assert.equal(comparison.unchanged, false);
    assert.equal(comparison.summary, "Backup identified in practice.");
    assert.equal(comparison.gapFullyResolved, true);
    assert.doesNotMatch(comparison.summary, /prepared/i);
  });

  it("says so honestly when the backup answer is unchanged", () => {
    const comparison = compareBackupRetry(
      "alone",
      completePhoneDependent,
      completePhoneDependent,
    );
    assert.equal(comparison.unchanged, true);
    assert.match(comparison.summary, /unchanged/);
    assert.match(comparison.summary, /still unanswered/);
  });
});

describe("reported answers versus Ready.gov follow-ups", () => {
  it("keeps candles as a reported plan and adds a flashlight follow-up", () => {
    const results = evaluateRehearsal("alone", {
      lighting: "candles",
      contact: "in-person",
      commBackup: "phone-or-text",
      supplies: "known-kit",
      openDetail: "updates",
    });
    assert.ok(results.plansIdentified.some((item) => item.choice.id === "candles"));
    const candleTask = results.detailsToPrepare.find((item) => item.choice.id === "candles");
    assert.equal(candleTask?.task, CANDLE_FOLLOW_UP);
    assert.match(candleTask?.task ?? "", /does not list candles/);
    assert.ok(results.detailsToPrepare.some((item) => item.task === KIT_LOCATION_FOLLOW_UP));
  });

  it("does not treat a phone light as complete lighting preparation", () => {
    const results = evaluateRehearsal("family", {
      lighting: "phone-light",
      contact: "internet-message",
      commBackup: "cellular",
      supplies: "cabinets",
      openDetail: "check-on-others",
    });
    assert.ok(results.plansIdentified.some((item) => item.choice.id === "phone-light"));
    const lightingTask = results.detailsToPrepare.find((item) => item.choice.id === "phone-light");
    assert.equal(lightingTask?.task, PHONE_LIGHT_FOLLOW_UP);
    assert.match(lightingTask?.task ?? "", /not a complete lighting plan/);
  });
});
