import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { canConfirmInterpretation, isFreshInterpretation } from "./freshness.ts";
import { getQuestion } from "./scenario.ts";
import {
  buildInterpretationPrompt,
  parseInterpretRequest,
  sanitizeInterpretation,
} from "./interpret.ts";

describe("parseInterpretRequest", () => {
  it("accepts a valid lighting answer and ignores extra prior answers", () => {
    const parsed = parseInterpretRequest({
      household: "family",
      stepId: "lighting",
      typedAnswer: "  We keep a lantern in the hall closet.  ",
      priorAnswers: { contact: "phone", lighting: "ignored" },
    });
    assert.equal(parsed.ok, true);
    if (!parsed.ok) return;
    assert.equal(parsed.data.typedAnswer, "We keep a lantern in the hall closet.");
    assert.deepEqual(parsed.data.priorAnswers, {});
    assert.equal(parsed.question.stepId, "lighting");
  });

  it("caps typed answers at 1000 characters", () => {
    const parsed = parseInterpretRequest({
      household: "alone",
      stepId: "supplies",
      typedAnswer: "a".repeat(1001),
    });
    assert.equal(parsed.ok, false);
  });

  it("uses contact for the internet communication backup step", () => {
    const parsed = parseInterpretRequest({
      household: "roommates",
      stepId: "commBackup",
      typedAnswer: "We would text if the apps are down.",
      priorAnswers: { contact: "internet-message", supplies: "known-kit" },
    });
    assert.equal(parsed.ok, true);
    if (!parsed.ok) return;
    assert.deepEqual(parsed.data.priorAnswers, { contact: "internet-message" });
    const expected = getQuestion("commBackup", "roommates", {
      contact: "internet-message",
    });
    assert.equal(parsed.question.id, expected.id);
    assert.ok(parsed.question.choices.some((choice) => choice.id === "cellular"));
  });

  it("resolves the phone-battery backup when lighting is phone-light and contact is phone", () => {
    const parsed = parseInterpretRequest({
      household: "family",
      stepId: "commBackup",
      typedAnswer: "We would meet at the mailbox.",
      priorAnswers: { lighting: "phone-light", contact: "phone" },
    });
    assert.equal(parsed.ok, true);
    if (!parsed.ok) return;
    assert.equal(parsed.question.id, "backup-phone-battery");
    assert.match(parsed.question.prompt, /phone battery is now nearly empty/);
  });

  it("keeps the delayed-calls backup when contact is phone but lighting is not", () => {
    const parsed = parseInterpretRequest({
      household: "alone",
      stepId: "commBackup",
      typedAnswer: "We would meet outside.",
      priorAnswers: { lighting: "known-flashlight", contact: "phone" },
    });
    assert.equal(parsed.ok, true);
    if (!parsed.ok) return;
    assert.equal(parsed.question.id, "backup-phone");
  });

  it("includes one untrusted clarification exchange with the follow-up answer", () => {
    const parsed = parseInterpretRequest({
      household: "alone",
      stepId: "lighting",
      typedAnswer: "It is already there",
      clarificationExchange: {
        previousAnswer: "I would keep my flashlight in the kitchen.",
        clarificationQuestion:
          "Is your flashlight already in the kitchen, or is that something you plan to arrange?",
      },
    });
    assert.equal(parsed.ok, true);
    if (!parsed.ok) return;
    assert.equal(parsed.data.clarificationExchange?.previousAnswer, "I would keep my flashlight in the kitchen.");
    const prompt = buildInterpretationPrompt(
      parsed.question,
      parsed.data.typedAnswer,
      parsed.data.clarificationExchange,
    );
    assert.match(prompt.userContent, /<previous_answer>/);
    assert.match(prompt.userContent, /I would keep my flashlight in the kitchen/);
    assert.match(prompt.userContent, /<clarification_question>/);
    assert.match(prompt.userContent, /It is already there/);
    assert.match(prompt.instructions, /untrusted data/);
  });

  it("rejects unknown household and step values", () => {
    assert.equal(
      parseInterpretRequest({
        household: "neighbors",
        stepId: "lighting",
        typedAnswer: "flashlight",
      }).ok,
      false,
    );
    assert.equal(
      parseInterpretRequest({
        household: "alone",
        stepId: "evacuation",
        typedAnswer: "flashlight",
      }).ok,
      false,
    );
  });
});

describe("sanitizeInterpretation", () => {
  const ids = ["known-flashlight", "phone-light", "unplanned"];

  it("keeps a permitted match when there is no clarification", () => {
    const result = sanitizeInterpretation(
      {
        matchedChoiceId: "phone-light",
        feedback: "You said you would use your phone flashlight.",
        clarification: null,
      },
      ids,
    );
    assert.equal(result.matchedChoiceId, "phone-light");
    assert.equal(result.clarification, null);
  });

  it("drops invented choice IDs and asks for clarification", () => {
    const result = sanitizeInterpretation(
      {
        matchedChoiceId: "generator",
        feedback: "You mentioned a generator.",
        clarification: null,
      },
      ids,
    );
    assert.equal(result.matchedChoiceId, null);
    assert.ok(result.clarification);
  });

  it("prefers clarification when the model also suggested a match", () => {
    const result = sanitizeInterpretation(
      {
        matchedChoiceId: "phone-light",
        feedback: "You mentioned a few options.",
        clarification: "Did you mean the flashlight on a phone?",
      },
      ids,
    );
    assert.equal(result.matchedChoiceId, null);
    assert.equal(result.clarification, "Did you mean the flashlight on a phone?");
  });
});

describe("buildInterpretationPrompt mapping quality", () => {
  const lighting = getQuestion("lighting", "alone", {});

  it("treats a current kitchen-drawer flashlight as eligible for the known-location choice", () => {
    const prompt = buildInterpretationPrompt(
      lighting,
      "My flashlight is in the kitchen drawer.",
    );
    assert.match(prompt.instructions, /current fact/i);
    assert.match(
      prompt.instructions,
      /My flashlight is in the kitchen drawer/i,
    );
    assert.match(prompt.instructions, /known-location lighting choice/i);
    assert.match(prompt.userContent, /My flashlight is in the kitchen drawer/);
    assert.match(prompt.userContent, /known-flashlight/);
  });

  it("treats 'I would keep' as a future intention, not completed preparation", () => {
    const prompt = buildInterpretationPrompt(
      lighting,
      "I would keep my flashlight in the kitchen.",
    );
    assert.match(prompt.instructions, /future intentions as completed preparation/i);
    assert.match(prompt.instructions, /I would keep/i);
    assert.match(prompt.userContent, /I would keep my flashlight in the kitchen/);
    assert.doesNotMatch(
      prompt.instructions,
      /Which of the listed choices is closest/i,
    );
  });

  it("asks clarification only about the missing fact, not a recap of every choice", () => {
    const prompt = buildInterpretationPrompt(
      lighting,
      "I would keep my flashlight in the kitchen.",
    );
    assert.match(
      prompt.instructions,
      /Is your flashlight already in the kitchen, or is that something you plan to arrange/i,
    );
    assert.match(prompt.instructions, /Do not list, recap, or quote the permitted choices/i);
    assert.match(prompt.instructions, /only the missing fact/i);
  });

  it("does not present candles as recommended lighting", () => {
    const prompt = buildInterpretationPrompt(lighting, "I have candles and matches.");
    assert.match(prompt.instructions, /Do not treat candles as recommended lighting/i);
    assert.match(prompt.userContent, /candles: Candles, matches/);
    assert.match(prompt.userContent, /not candles/);
  });
});

describe("isFreshInterpretation", () => {
  it("rejects stale responses after navigation or edits", () => {
    const base = {
      requestId: 2,
      currentRequestId: 2,
      stepId: "lighting",
      currentStepId: "lighting",
      submittedText: "phone flashlight",
      currentText: "phone flashlight",
    };
    assert.equal(isFreshInterpretation(base), true);
    assert.equal(
      isFreshInterpretation({ ...base, currentRequestId: 3 }),
      false,
    );
    assert.equal(
      isFreshInterpretation({ ...base, currentStepId: "contact" }),
      false,
    );
    assert.equal(
      isFreshInterpretation({ ...base, currentText: "candles instead" }),
      false,
    );
  });
});

describe("canConfirmInterpretation", () => {
  it("allows confirmation only for a clear match without clarification", () => {
    assert.equal(
      canConfirmInterpretation({
        matchedChoiceId: "phone-light",
        feedback: "You mentioned a phone flashlight.",
        clarification: null,
      }),
      "phone-light",
    );
    assert.equal(
      canConfirmInterpretation({
        matchedChoiceId: "phone-light",
        feedback: "You mentioned a few options.",
        clarification: "Did you mean the flashlight on a phone?",
      }),
      null,
    );
    assert.equal(
      canConfirmInterpretation({
        matchedChoiceId: null,
        feedback: "You said it depends.",
        clarification: "Which listed choice is closest?",
      }),
      null,
    );
  });
});
