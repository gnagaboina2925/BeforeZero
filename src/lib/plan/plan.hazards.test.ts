import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { detectDependenciesFromText } from "./detect.ts";
import { evaluateRevisedPlan } from "./evaluate.ts";
import { TORNADO_COMPLICATIONS, TORNADO_PLAN_EXAMPLE } from "./tornado.ts";
import { HOME_FIRE_COMPLICATIONS, HOME_FIRE_PLAN_EXAMPLE } from "./homeFire.ts";
import {
  fallbackPlanInterpretation,
  parsePlanInterpretRequest,
  sanitizePlanInterpretation,
} from "./interpret.ts";
import { interpretPlanUtterance } from "./interpretAction.ts";
import { exampleComplication, selectSupportedComplication } from "./select.ts";
import { LESSON_SOURCES } from "../lesson/sources.ts";
import { ProviderRequestError } from "../xai.ts";

describe("plan hazard separation", () => {
  it("keeps hurricane detection from selecting tornado or home-fire kinds", () => {
    const text =
      "I get alerts on my phone. I plan to shelter in the basement but have not arranged how I would get there. I have a smoke alarm I may not hear. I would leave through the front door.";
    const deps = detectDependenciesFromText(text, "hurricane");
    assert.ok(deps.some((item) => item.kind === "communication"));
    assert.equal(deps.some((item) => item.kind === "shelter-access"), false);
    assert.equal(deps.some((item) => item.kind === "alarm-perception"), false);
    assert.equal(deps.some((item) => item.kind === "blocked-exit"), false);
    assert.equal(deps.some((item) => item.kind === "elevator"), false);
  });

  it("keeps tornado detection from selecting elevator, flood, or fire-only kinds", () => {
    const text =
      "I get Wireless Emergency Alerts on my phone, text my neighbor, and plan to shelter in the basement but have not arranged how I would get there. I take an elevator at work. I have a smoke alarm I may not hear.";
    const deps = detectDependenciesFromText(text, "tornado");
    assert.ok(deps.some((item) => item.kind === "communication"));
    assert.ok(deps.some((item) => item.kind === "support"));
    assert.ok(deps.some((item) => item.kind === "shelter-access"));
    assert.equal(deps.some((item) => item.kind === "elevator"), false);
    assert.equal(deps.some((item) => item.kind === "alarm-perception"), false);
    assert.equal(deps.some((item) => item.kind === "blocked-exit"), false);
    for (const copy of Object.values(TORNADO_COMPLICATIONS)) {
      assert.equal(/\bflood/i.test(`${copy.whatToDo} ${copy.whatToDoPlain}`), false);
      assert.ok(copy.sourceIds.every((id) => id in LESSON_SOURCES));
    }
  });

  it("keeps home-fire detection from selecting weather-alert or tornado-shelter kinds", () => {
    const text =
      "I have a smoke alarm I may not hear, would leave through the front door, and would call my neighbor. I also listen to a weather radio and would go to the basement.";
    const deps = detectDependenciesFromText(text, "home-fire");
    assert.ok(deps.some((item) => item.kind === "alarm-perception"));
    assert.ok(deps.some((item) => item.kind === "blocked-exit"));
    assert.ok(deps.some((item) => item.kind === "support"));
    assert.equal(deps.some((item) => item.kind === "communication"), false);
    assert.equal(deps.some((item) => item.kind === "shelter-access"), false);
    assert.equal(deps.some((item) => item.kind === "elevator"), false);
    for (const copy of Object.values(HOME_FIRE_COMPLICATIONS)) {
      assert.equal(/\bflood|tornado warning/i.test(`${copy.whatToDo} ${copy.whatToDoPlain}`), false);
      assert.ok(copy.sourceIds.every((id) => id in LESSON_SOURCES));
    }
  });
});

describe("evidence-supported complication selection", () => {
  it("does not treat a smoke alarm alone as alarm-perception", () => {
    const text = "I have a smoke alarm in the hallway.";
    assert.equal(detectDependenciesFromText(text, "home-fire").some((item) => item.kind === "alarm-perception"), false);
  });

  it("keeps naming a smoke alarm distinct from describing a perception concern", () => {
    const text = "My planned exit is the front door. I have a smoke alarm.";
    const fallback = fallbackPlanInterpretation(text, "home-fire");
    assert.deepEqual(
      fallback.dependencies.map((item) => item.kind),
      ["blocked-exit"],
    );
    assert.equal(fallback.dependencies.some((item) => item.kind === "alarm-perception"), false);
    const alarm = fallback.observations.find((item) => item.topic === "alarm");
    const exit = fallback.observations.find((item) => item.topic === "exit");
    assert.equal(exit?.status, "mentioned");
    assert.equal(alarm?.status, "not-mentioned");
    assert.equal(
      alarm?.note,
      "You mentioned a smoke alarm but did not describe difficulty noticing its signal.",
    );
    assert.equal(/suitable|verified|working/i.test(alarm?.note ?? ""), false);
    const sanitized = sanitizePlanInterpretation(
      {
        summary: "You named the front door and a smoke alarm.",
        observations: [
          {
            topic: "alarm",
            status: "not-mentioned",
            evidenceQuote: null,
            note: "alarm signals were not mentioned. That is not the same as deciding they are unneeded.",
          },
        ],
        dependencies: [],
        gaps: [],
        clarification: null,
      },
      text,
      0,
      "home-fire",
    );
    assert.ok(sanitized.dependencies.some((item) => item.kind === "blocked-exit"));
    assert.equal(sanitized.dependencies.some((item) => item.kind === "alarm-perception"), false);
    assert.equal(
      sanitized.observations.find((item) => item.topic === "alarm")?.note,
      "You mentioned a smoke alarm but did not describe difficulty noticing its signal.",
    );
  });

  it("selects alarm-perception only when the user says they may not perceive it", () => {
    const text = "I have a smoke alarm I may not hear.";
    const deps = detectDependenciesFromText(text, "home-fire");
    assert.ok(deps.some((item) => item.kind === "alarm-perception"));
    assert.equal(selectSupportedComplication(deps, { hazardId: "home-fire" })?.kind, "alarm-perception");
  });

  it("does not infer shelter-access from a wheelchair mention alone", () => {
    const text = "I use a wheelchair. I get alerts on a weather radio.";
    const deps = detectDependenciesFromText(text, "tornado");
    assert.equal(deps.some((item) => item.kind === "shelter-access"), false);
    assert.ok(deps.some((item) => item.kind === "communication"));
  });

  it("selects shelter-access when a named shelter has unresolved access in the user's words", () => {
    const text = "I cannot get to the basement.";
    const deps = detectDependenciesFromText(text, "tornado");
    assert.deepEqual(
      deps.map((item) => item.kind),
      ["shelter-access"],
    );
  });

  it("does not treat a named basement without an access gap as shelter-access", () => {
    const text = "During a warning I go to the basement away from windows.";
    assert.equal(detectDependenciesFromText(text, "tornado").some((item) => item.kind === "shelter-access"), false);
    assert.equal(
      detectDependenciesFromText("My shelter is the basement", "tornado").some((item) => item.kind === "shelter-access"),
      false,
    );
  });

  it("does not treat arranged basement access as unresolved", () => {
    const text = "I have arranged how to reach the basement.";
    assert.equal(detectDependenciesFromText(text, "tornado").some((item) => item.kind === "shelter-access"), false);
  });

  it("keeps hedged basement wording subject to confirmation", () => {
    const text = "I might go to the basement.";
    const fallback = fallbackPlanInterpretation(text, "tornado");
    assert.equal(fallback.dependencies.some((item) => item.kind === "shelter-access"), false);
    assert.ok(fallback.ambiguousKinds.includes("shelter-access"));
  });

  it("recognizes named basement plus unresolved access, including a pronoun and typographic apostrophe", () => {
    const text =
      "I get warnings on my phone. My neighbor is my planned support person. My shelter is the basement, but I haven’t arranged how to reach it.";
    const fallback = fallbackPlanInterpretation(text, "tornado");
    assert.deepEqual(
      fallback.dependencies.map((item) => item.kind).sort(),
      ["communication", "shelter-access", "support"],
    );
    const access = fallback.observations.find((item) => item.topic === "access");
    assert.equal(access?.status, "mentioned");
    assert.equal(
      fallback.dependencies.find((item) => item.kind === "shelter-access")?.evidenceQuote,
      "My shelter is the basement, but I haven’t arranged how to reach it.",
    );
    assert.equal(
      fallback.dependencies.find((item) => item.kind === "communication")?.evidenceQuote,
      "I get warnings on my phone.",
    );
    assert.equal(
      fallback.dependencies.find((item) => item.kind === "support")?.evidenceQuote,
      "My neighbor is my planned support person.",
    );
    const split =
      "I get warnings on my phone. My neighbor is my planned support person. My shelter is the basement. I haven’t arranged how to reach it.";
    assert.ok(detectDependenciesFromText(split, "tornado").some((item) => item.kind === "shelter-access"));
  });

  it("keeps observations and shelter-access checkboxes aligned when Grok marks access not-planned", () => {
    const text =
      "I get warnings on my phone. My neighbor is my planned support person. My shelter is the basement, but I haven’t arranged how to reach it.";
    const sanitized = sanitizePlanInterpretation(
      {
        summary: "You named alerts, a neighbor, and unplanned basement access.",
        observations: [
          {
            topic: "access",
            status: "not-planned",
            evidenceQuote: "I haven’t arranged how to reach it",
            note: "unplanned",
          },
        ],
        dependencies: [],
        gaps: [],
        clarification: null,
      },
      text,
      0,
      "tornado",
    );
    assert.deepEqual(
      sanitized.dependencies.map((item) => item.kind).sort(),
      ["communication", "shelter-access", "support"],
    );
    assert.equal(sanitized.observations.find((item) => item.topic === "access")?.status, "mentioned");
    assert.equal(sanitized.observations.find((item) => item.topic === "alerts")?.status, "mentioned");
    assert.equal(sanitized.observations.find((item) => item.topic === "support")?.status, "mentioned");
  });

  it("does not treat negated support as a home-fire support dependency", () => {
    const text = "My neighbor cannot help. I would leave through the front door.";
    const deps = detectDependenciesFromText(text, "home-fire");
    assert.equal(deps.some((item) => item.kind === "support"), false);
    assert.ok(deps.some((item) => item.kind === "blocked-exit"));
  });

  it("preserves user choice among tornado dependencies", () => {
    const deps = detectDependenciesFromText(TORNADO_PLAN_EXAMPLE.text, "tornado");
    assert.ok(deps.length > 1);
    assert.equal(selectSupportedComplication(deps, { hazardId: "tornado" }), null);
    assert.equal(
      selectSupportedComplication(deps, { hazardId: "tornado", chosenKind: "shelter-access" })?.kind,
      "shelter-access",
    );
    assert.equal(exampleComplication("tornado").kind, "communication");
    assert.equal(exampleComplication("home-fire").kind, "alarm-perception");
  });

  it("keeps a mismatched home-fire revision as a separate task", () => {
    const original = HOME_FIRE_PLAN_EXAMPLE.text;
    const review = evaluateRevisedPlan({
      kind: "alarm-perception",
      originalText: original,
      revisedText: "I would also name another support person.",
      selectedChoiceIds: [],
      hazardId: "home-fire",
    });
    assert.equal(review.selectedKind, "alarm-perception");
    assert.ok(review.otherDependencyNote);
    assert.match(review.otherDependencyNote ?? "", /still unresolved/);
    assert.ok(review.remainingGaps.some((item) => /perceive/i.test(item)));
  });

  it("does not treat covering in place as finishing tornado shelter access", () => {
    const review = evaluateRevisedPlan({
      kind: "shelter-access",
      originalText: TORNADO_PLAN_EXAMPLE.text,
      revisedText: "If I could not move I would cover with blankets and pillows.",
      selectedChoiceIds: ["during-cover-only"],
      hazardId: "tornado",
    });
    assert.ok(review.remainingGaps.some((item) => /before severe weather/i.test(item)));
    assert.equal(review.warning, null);
  });

  it("falls back when the tornado interpret provider fails", async () => {
    const parsed = parsePlanInterpretRequest({
      utterance: "I would use my phone.",
      hazard: "tornado",
    });
    assert.equal(parsed.ok, true);
    if (!parsed.ok) return;
    assert.equal(parsed.hazardId, "tornado");
    const fallback = fallbackPlanInterpretation("I would use my phone.", "tornado");
    assert.equal(fallback.usedFallback, true);
    assert.ok(fallback.dependencies.some((item) => item.kind === "communication"));
    const result = await interpretPlanUtterance(
      { utterance: "I would use my phone.", hazard: "tornado" },
      {
        apiKey: "test-key",
        complete: async () => {
          throw new ProviderRequestError("unavailable", "unavailable", 503, "unavailable");
        },
      },
    );
    assert.equal(result.usedFallback, true);
    const sanitized = sanitizePlanInterpretation(
      {
        summary: "You rely on an elevator and a smoke alarm you cannot hear.",
        observations: [],
        dependencies: [
          { kind: "elevator", label: "elevator", evidenceQuote: "elevator" },
          { kind: "alarm-perception", label: "alarm", evidenceQuote: "smoke alarm" },
        ],
        gaps: [],
        clarification: null,
      },
      "I would use my phone.",
      0,
      "tornado",
    );
    assert.equal(sanitized.dependencies.some((item) => item.kind === "elevator"), false);
    assert.equal(sanitized.dependencies.some((item) => item.kind === "alarm-perception"), false);
  });
});
