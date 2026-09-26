import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { interpretTypedAnswer } from "./interpretAnswer.ts";
import {
  completeStructuredJson,
  extractOutputText,
  mapProviderFailure,
  ProviderRequestError,
} from "./xai.ts";

describe("completeStructuredJson request body", () => {
  it("omits search_parameters from the Chat Completions request", async () => {
    let parsedBody: Record<string, unknown> | null = null;

    await completeStructuredJson({
      apiKey: "test-key",
      model: "grok-4.3",
      instructions: "Map answers.",
      userContent: "phone flashlight",
      schema: { type: "object" },
      fetchImpl: async (_url, init) => {
        parsedBody = JSON.parse(String(init?.body)) as Record<string, unknown>;
        return new Response(
          JSON.stringify({
            choices: [
              {
                finish_reason: "stop",
                message: {
                  content: JSON.stringify({
                    matchedChoiceId: "phone-light",
                    feedback: "You mentioned a phone flashlight.",
                    clarification: null,
                  }),
                },
              },
            ],
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        );
      },
    });

    assert.ok(parsedBody);
    assert.equal(Object.hasOwn(parsedBody, "search_parameters"), false);
  });
});

describe("mapProviderFailure", () => {
  it("maps auth, credit, and rate-limit statuses without provider text", () => {
    assert.equal(mapProviderFailure(401).code, "auth_failed");
    assert.equal(mapProviderFailure(402).code, "insufficient_credits");
    assert.equal(mapProviderFailure(429).code, "rate_limited");
    assert.equal(mapProviderFailure(400).code, "invalid_request");
    assert.equal(mapProviderFailure(404).code, "unavailable_model");
    assert.equal(mapProviderFailure(500).message.includes("xAI"), false);
  });
});

describe("extractOutputText", () => {
  it("reads Responses API output_text and Chat Completions message content", () => {
    assert.equal(
      extractOutputText({ output_text: '{"matchedChoiceId":null}' }),
      '{"matchedChoiceId":null}',
    );
    assert.equal(
      extractOutputText({
        choices: [{ message: { content: '{"from":"chat"}' } }],
      }),
      '{"from":"chat"}',
    );
    assert.equal(
      extractOutputText({
        choices: [
          {
            message: {
              content: [{ type: "text", text: '{"from":"parts"}' }],
            },
          },
        ],
      }),
      '{"from":"parts"}',
    );
    assert.equal(
      extractOutputText({
        output: [
          { type: "reasoning", content: [] },
          {
            type: "message",
            content: [{ type: "output_text", text: '{"ok":true}' }],
          },
        ],
      }),
      '{"ok":true}',
    );
  });
});

describe("interpretTypedAnswer", () => {
  it("maps a mocked provider payload onto a permitted choice", async () => {
    const result = await interpretTypedAnswer(
      {
        household: "alone",
        stepId: "lighting",
        typedAnswer: "I would use the flashlight on my phone.",
      },
      {
        apiKey: "test-key",
        complete: async () => ({
          matchedChoiceId: "phone-light",
          feedback: "You said you would use the flashlight on your phone.",
          clarification: null,
        }),
      },
    );
    assert.equal(result.matchedChoiceId, "phone-light");
    assert.equal(result.clarification, null);
  });

  it("asks for clarification when the mocked payload has no clear match", async () => {
    const result = await interpretTypedAnswer(
      {
        household: "family",
        stepId: "contact",
        typedAnswer: "We might do several things depending on the day.",
      },
      {
        apiKey: "test-key",
        complete: async () => ({
          matchedChoiceId: null,
          feedback: "You said it would depend on the day.",
          clarification: "Would you use a phone call, internet messaging, or meet in person?",
        }),
      },
    );
    assert.equal(result.matchedChoiceId, null);
    assert.match(result.clarification ?? "", /phone call/i);
  });

  it("surfaces a mocked provider failure without raw details", async () => {
    await assert.rejects(
      () =>
        interpretTypedAnswer(
          {
            household: "roommates",
            stepId: "supplies",
            typedAnswer: "The kit under the sink.",
          },
          {
            apiKey: "test-key",
            complete: async () => {
              throw new ProviderRequestError(
                "unavailable",
                "Interpretation is unavailable right now. You can still use the listed choices.",
                500,
              );
            },
          },
        ),
      (error: unknown) => {
        assert.ok(error instanceof ProviderRequestError);
        assert.equal(error.code, "unavailable");
        assert.equal(error.message.includes("stack"), false);
        return true;
      },
    );
  });
});
