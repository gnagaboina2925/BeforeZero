import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { detectCommMethods, detectDependenciesFromText, groundedSummary, quoteAppearsInPlan } from "./detect.ts";
import { evaluateRevisedPlan } from "./evaluate.ts";
import {
  fallbackPlanInterpretation,
  parsePlanInterpretRequest,
  sanitizePlanInterpretation,
} from "./interpret.ts";
import { interpretPlanUtterance } from "./interpretAction.ts";
import { exampleComplication, selectSupportedComplication } from "./select.ts";
import { COMPLICATIONS, PLAN_EXAMPLE } from "./catalog.ts";
import { LESSON_SOURCES } from "../lesson/sources.ts";
import { ProviderRequestError } from "../xai.ts";

describe("plan dependency detection", () => {
  it("does not auto-select when several supported dependencies exist", () => {
    const text = "I would watch Wireless Emergency Alerts on my phone and text my neighbor.";
    const deps = detectDependenciesFromText(text);
    assert.ok(deps.some((item) => item.kind === "communication"));
    assert.ok(deps.some((item) => item.kind === "support"));
    assert.equal(deps.some((item) => item.kind === "elevator"), false);
    assert.equal(selectSupportedComplication(deps), null);
    assert.equal(selectSupportedComplication(deps, { chosenKind: "support" })?.kind, "support");
    assert.equal(selectSupportedComplication([]), null);
    assert.equal(exampleComplication().source, "example");
  });

  it("selects an elevator complication only when the words mention one", () => {
    const deps = detectDependenciesFromText("If the elevator is out I am not sure what I would do.");
    assert.deepEqual(
      deps.map((item) => item.kind),
      ["elevator"],
    );
    assert.equal(selectSupportedComplication(deps)?.kind, "elevator");
  });

  it("does not treat negated elevator use as elevator dependence", () => {
    const text = "I do not use an elevator. I get alerts on a weather radio.";
    const deps = detectDependenciesFromText(text);
    assert.equal(deps.some((item) => item.kind === "elevator"), false);
    const sanitized = sanitizePlanInterpretation(
      {
        summary: "You depend on an elevator.",
        observations: [{ topic: "access", status: "mentioned", evidenceQuote: "use an elevator", note: "wrong" }],
        dependencies: [{ kind: "elevator", label: "elevator", evidenceQuote: "use an elevator" }],
        gaps: [],
        clarification: null,
      },
      text,
      0,
    );
    assert.equal(sanitized.dependencies.some((item) => item.kind === "elevator"), false);
    assert.equal(sanitized.observations.find((item) => item.topic === "access")?.status, "not-mentioned");
  });

  it("marks access as not specified when the plan only excludes elevator use", () => {
    const text = "I do not use an elevator";
    const sanitized = sanitizePlanInterpretation(
      {
        summary: "Access is not planned because you do not use an elevator.",
        observations: [
          {
            topic: "access",
            status: "not-planned",
            evidenceQuote: "I do not use an elevator",
            note: "unplanned",
          },
        ],
        dependencies: [{ kind: "elevator", label: "elevator", evidenceQuote: "I do not use an elevator" }],
        gaps: [],
        clarification: null,
      },
      text,
      0,
    );
    const access = sanitized.observations.find((item) => item.topic === "access");
    assert.equal(sanitized.dependencies.some((item) => item.kind === "elevator"), false);
    assert.equal(access?.status, "not-mentioned");
    assert.equal(access?.status === "not-planned", false);
    assert.match(access?.note ?? "", /not specified/i);
    const fallback = fallbackPlanInterpretation(text);
    assert.equal(fallback.observations.find((item) => item.topic === "access")?.status, "not-mentioned");
    assert.equal(fallback.ambiguousKinds.includes("elevator"), false);
  });

  it("does not treat a neighbor who cannot help as arranged support", () => {
    const text = "My neighbor cannot help. I listen to a weather radio.";
    const deps = detectDependenciesFromText(text);
    assert.equal(deps.some((item) => item.kind === "support"), false);
    const fallback = fallbackPlanInterpretation(text);
    assert.equal(fallback.observations.find((item) => item.topic === "support")?.status, "not-planned");
  });

  it("does not describe a phone and battery radio as relying only on a phone", () => {
    const text = "I have a phone and a battery radio";
    const methods = detectCommMethods(text);
    assert.ok(methods.includes("phone"));
    assert.ok(methods.includes("radio"));
    const rewritten = groundedSummary("You are relying only on a phone for alerts.", text);
    assert.equal(/only on a phone/i.test(rewritten), false);
    assert.match(rewritten, /more than one way/i);
    const sanitized = sanitizePlanInterpretation(
      {
        summary: "You are relying only on a phone.",
        observations: [],
        dependencies: [{ kind: "communication", label: "phone", evidenceQuote: "phone" }],
        gaps: [],
        clarification: null,
      },
      text,
      0,
    );
    assert.equal(/only on a phone/i.test(sanitized.summary), false);
  });

  it("asks for confirmation when wording is hedged", () => {
    const text = "I might use the elevator if I have to.";
    assert.equal(detectDependenciesFromText(text).length, 0);
    const sanitized = sanitizePlanInterpretation({ summary: text, observations: [], dependencies: [], gaps: [], clarification: null }, text, 0);
    assert.ok(sanitized.ambiguousKinds.includes("elevator"));
    assert.ok(sanitized.clarification);
    assert.equal(sanitized.observations.find((item) => item.topic === "access")?.status, "ambiguous");
  });
});

describe("plan interpretation sanitizer", () => {
  it("drops dependencies that are not in the user's words", () => {
    const utterance = "I get alerts on my phone.";
    const sanitized = sanitizePlanInterpretation(
      {
        summary: "You get alerts on a phone.",
        observations: [
          { topic: "alerts", status: "mentioned", evidenceQuote: "alerts on my phone", note: "ok" },
          { topic: "support", status: "not-mentioned", evidenceQuote: null, note: "missing" },
        ],
        dependencies: [
          { kind: "communication", label: "phone alerts", evidenceQuote: "alerts on my phone" },
          { kind: "elevator", label: "elevator", evidenceQuote: "the elevator in my building" },
        ],
        gaps: [],
        clarification: null,
      },
      utterance,
      0,
    );
    assert.deepEqual(
      sanitized.dependencies.map((item) => item.kind),
      ["communication"],
    );
    assert.equal(quoteAppearsInPlan("the elevator in my building", utterance), false);
  });

  it("keeps not-mentioned distinct from not-planned", () => {
    const utterance = "I do not have a backup person yet. I use a weather radio.";
    const sanitized = sanitizePlanInterpretation(
      {
        summary: utterance,
        observations: [
          { topic: "support", status: "not-planned", evidenceQuote: "I do not have a backup person yet", note: "unplanned" },
          { topic: "access", status: "not-mentioned", evidenceQuote: null, note: "unsaid" },
        ],
        dependencies: [{ kind: "communication", label: "radio", evidenceQuote: "weather radio" }],
        gaps: [],
        clarification: "Should I assume an elevator?",
      },
      utterance,
      1,
    );
    const support = sanitized.observations.find((item) => item.topic === "support");
    const access = sanitized.observations.find((item) => item.topic === "access") ?? sanitized.gaps.find((item) => item.topic === "access");
    assert.equal(support?.status, "not-planned");
    assert.equal(access?.status ?? "not-mentioned", "not-mentioned");
    assert.equal(sanitized.clarification, null);
  });

  it("keeps a neighbor contact even if the model omits it", () => {
    const utterance = PLAN_EXAMPLE.text;
    const sanitized = sanitizePlanInterpretation(
      {
        summary: "Example plan.",
        observations: [],
        dependencies: [{ kind: "communication", label: "phone", evidenceQuote: "Alerts on a phone" }],
        gaps: [],
        clarification: null,
      },
      utterance,
      0,
    );
    assert.ok(sanitized.dependencies.some((item) => item.kind === "support"));
    assert.ok(sanitized.dependencies.some((item) => item.kind === "elevator"));
  });

  it("parses requests and falls back when Grok is unavailable", async () => {
    assert.equal(parsePlanInterpretRequest({}).ok, false);
    const parsed = parsePlanInterpretRequest({ utterance: "I would use my phone." });
    assert.equal(parsed.ok, true);
    const fallback = fallbackPlanInterpretation("I would use my phone.");
    assert.equal(fallback.usedFallback, true);
    assert.equal(fallback.dependencies[0]?.kind, "communication");
    const result = await interpretPlanUtterance(
      { utterance: "I would use my phone." },
      {
        apiKey: "test-key",
        complete: async () => {
          throw new ProviderRequestError("unavailable", "unavailable", 503, "unavailable");
        },
      },
    );
    assert.equal(result.usedFallback, true);
    assert.ok(result.dependencies.some((item) => item.kind === "communication"));
  });
});

describe("revised plan evaluation", () => {
  it("keeps a gap when the same communication method is the only revision", () => {
    const review = evaluateRevisedPlan({
      kind: "communication",
      originalText: "I use my phone.",
      revisedText: "I use my phone.",
      selectedChoiceIds: ["same-method-only"],
    });
    assert.ok(review.remainingGaps.some((item) => /second official way/i.test(item)));
    assert.equal(/proves preparedness/i.test(review.stillNeedsConfirming.join(" ")), false);
    assert.match(review.stillNeedsConfirming.join(" "), /does not prove preparedness/i);
  });

  it("rejects carrying or invented routes for an elevator complication", () => {
    const review = evaluateRevisedPlan({
      kind: "elevator",
      originalText: "I take the elevator.",
      revisedText: "Someone can carry me down.",
      selectedChoiceIds: ["carry-or-invent"],
    });
    assert.ok(review.warning);
    assert.ok(review.remainingGaps.length > 0);
    for (const task of review.preparationTasks) {
      assert.ok(task.sourceId in LESSON_SOURCES);
    }
    assert.ok(COMPLICATIONS.elevator.sourceIds.every((id) => id in LESSON_SOURCES));
  });

  it("preserves a chosen communication complication when support is also in the plan", () => {
    const original =
      "My plan depends on my phone for updates and my neighbor for assistance. I haven't arranged another support person.";
    const deps = detectDependenciesFromText(original);
    assert.ok(deps.some((item) => item.kind === "communication"));
    assert.ok(deps.some((item) => item.kind === "support"));
    assert.equal(selectSupportedComplication(deps), null);
    assert.equal(selectSupportedComplication(deps, { chosenKind: "communication" })?.kind, "communication");
    assert.equal(selectSupportedComplication(deps, { chosenKind: "support" })?.kind, "support");
    const review = evaluateRevisedPlan({
      kind: "communication",
      originalText: original,
      revisedText: "I would also use a weather radio.",
      selectedChoiceIds: ["second-alert-channel"],
    });
    assert.equal(review.selectedKind, "communication");
    assert.equal(review.otherDependencyNote, null);
  });

  it("keeps a support-person task when the revision does not resolve the rehearsed communication backup", () => {
    const original =
      "My plan depends on my phone for updates and my neighbor for assistance. I haven't arranged another support person.";
    const review = evaluateRevisedPlan({
      kind: "communication",
      originalText: original,
      revisedText: "I still need to arrange another support person.",
      selectedChoiceIds: [],
    });
    assert.equal(review.selectedKind, "communication");
    assert.equal(
      review.otherDependencyNote,
      "You identified a support-person task. The communication backup explored in this rehearsal is still unresolved.",
    );
    assert.ok(review.remainingGaps.some((item) => /second official way/i.test(item)));
    assert.equal(review.addressedSummary, "A support-person task");
    assert.ok(review.otherPlanningTasks.some((item) => /another support person/i.test(item.text)));
    assert.equal(review.otherPlanningTasks.every((item) => item.kind === "support"), true);
    assert.ok(review.sourceExcerpts.every((item) => item.excerpt.length > 0));
  });
});
