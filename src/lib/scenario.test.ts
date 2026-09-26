import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  getDependentSteps,
  getQuestion,
  isPhoneDependentComplication,
  PHONE_BATTERY_PROMPT,
  spokenQuestionText,
  STEP_ORDER,
} from "./scenario.ts";

describe("communication backup branches", () => {
  it("keeps five rehearsal steps", () => {
    assert.deepEqual(STEP_ORDER, [
      "lighting",
      "contact",
      "commBackup",
      "supplies",
      "openDetail",
    ]);
  });

  it("introduces the simulated phone-battery backup for phone lighting and phone contact", () => {
    const answers = { lighting: "phone-light", contact: "phone" };
    assert.equal(isPhoneDependentComplication(answers), true);
    const question = getQuestion("commBackup", "alone", answers);
    assert.equal(question.id, "backup-phone-battery");
    assert.equal(question.prompt, PHONE_BATTERY_PROMPT);
    assert.match(question.eventNotice ?? "", /not a real battery reading/);
    assert.ok(question.choices.some((choice) => choice.id === "meeting-place"));
    assert.ok(question.choices.some((choice) => choice.id === "another-charged-device"));
    assert.ok(question.choices.some((choice) => choice.id === "unplanned"));
    assert.equal(
      spokenQuestionText(question),
      `${question.eventNotice} ${question.prompt}`,
    );
  });

  it("keeps the existing delayed-calls backup when lighting is not phone-based", () => {
    const question = getQuestion("commBackup", "roommates", {
      lighting: "known-flashlight",
      contact: "phone",
    });
    assert.equal(question.id, "backup-phone");
    assert.match(question.prompt, /calls and texts are delayed/);
    assert.equal(question.eventNotice, undefined);
  });

  it("keeps the existing internet backup branch", () => {
    const question = getQuestion("commBackup", "family", {
      lighting: "phone-light",
      contact: "internet-message",
    });
    assert.equal(question.id, "backup-internet");
    assert.ok(question.choices.some((choice) => choice.id === "cellular"));
  });

  it("uses solo wording for living alone and household wording for family", () => {
    const aloneContact = getQuestion("contact", "alone", {});
    const familyContact = getQuestion("contact", "family", {});
    assert.equal(aloneContact.title, "Contacting someone you trust");
    assert.equal(familyContact.title, "Contacting household members");
    assert.equal(aloneContact.choices[0].id, familyContact.choices[0].id);

    const aloneLight = getQuestion("lighting", "alone", {});
    const familyLight = getQuestion("lighting", "family", {});
    assert.equal(aloneLight.choices.find((choice) => choice.id === "known-flashlight")?.label, "Flashlights or lanterns I keep in a known place");
    assert.equal(familyLight.choices.find((choice) => choice.id === "known-flashlight")?.label, "Flashlights or lanterns we keep in a known place");

    const roommatesSupplies = getQuestion("supplies", "roommates", {});
    assert.match(roommatesSupplies.choices.find((choice) => choice.id === "known-kit")?.label ?? "", /we keep/);
  });

  it("marks candles as a reported option, not recommended lighting", () => {
    const candles = getQuestion("lighting", "alone", {}).choices.find((choice) => choice.id === "candles");
    assert.match(candles?.hint ?? "", /not candles/);
    assert.match(candles?.preparationTask ?? "", /does not list candles/);
  });

  it("qualifies meeting-place wording so it is not a travel instruction", () => {
    const question = getQuestion("commBackup", "family", {
      lighting: "known-flashlight",
      contact: "phone",
    });
    const meeting = question.choices.find((choice) => choice.id === "meeting-place");
    assert.match(meeting?.label ?? "", /officials have not directed otherwise/);
    assert.match(meeting?.hint ?? "", /not a direction to travel/);
  });

  it("clears comm backup when lighting or contact changes", () => {
    assert.deepEqual(getDependentSteps("lighting"), ["commBackup"]);
    assert.deepEqual(getDependentSteps("contact"), ["commBackup"]);
    assert.deepEqual(getDependentSteps("supplies"), []);
  });
});
