import assert from "node:assert/strict";
import { describe, it } from "node:test";
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
      openDetail: "meeting-if-separated",
    });
    assert.equal(results.phoneDependent, false);
    assert.equal(results.backupIdentified, true);
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
