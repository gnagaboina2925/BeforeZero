import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  apiKeyPresent,
  classifyHttpFailure,
  extractProviderClientError,
  logInterpretDiagnostic,
  readProviderErrorFields,
  tokenOrNull,
} from "./diagnostics.ts";

describe("apiKeyPresent", () => {
  it("checks presence without using the value beyond emptiness", () => {
    assert.equal(apiKeyPresent(undefined), false);
    assert.equal(apiKeyPresent(""), false);
    assert.equal(apiKeyPresent("   "), false);
    assert.equal(apiKeyPresent("present"), true);
  });
});

describe("classifyHttpFailure", () => {
  it("distinguishes auth, credits, model, schema, and timeout statuses", () => {
    assert.equal(classifyHttpFailure(401, null), "auth_failed");
    assert.equal(classifyHttpFailure(402, null), "insufficient_credits");
    assert.equal(classifyHttpFailure(404, null), "unavailable_model");
    assert.equal(classifyHttpFailure(400, { code: "invalid_argument" }), "invalid_request");
    assert.equal(
      classifyHttpFailure(400, { error: { message: "json_schema was rejected" } }),
      "invalid_schema",
    );
    assert.equal(
      classifyHttpFailure(400, { error: "The model grok-example was not found" }),
      "unavailable_model",
    );
    assert.equal(classifyHttpFailure(429, null), "rate_limited");
    assert.equal(classifyHttpFailure(504, null), "timeout");
    assert.equal(classifyHttpFailure(500, null), "unavailable");
  });
});

describe("readProviderErrorFields", () => {
  it("keeps short tokens and drops sentence-length codes", () => {
    assert.equal(tokenOrNull("model_not_found"), "model_not_found");
    assert.equal(tokenOrNull("Client specified an invalid argument."), null);
    const fields = readProviderErrorFields({
      code: "invalid_request_error",
      error: { message: "schema was rejected" },
    });
    assert.equal(fields.providerCodeToken, "invalid_request_error");
    assert.equal(fields.mentionsSchema, true);
  });
});

describe("extractProviderClientError", () => {
  it("extracts message and param, redacts credentials, and truncates", () => {
    const extracted = extractProviderClientError({
      error: {
        message: "Unknown parameter: Bearer supersecret-token api_key=abcd",
        param: "response_format",
      },
    });
    assert.equal(extracted.providerErrorParam, "response_format");
    assert.match(extracted.providerErrorMessage ?? "", /Unknown parameter/);
    assert.equal(extracted.providerErrorMessage?.includes("supersecret-token"), false);
    assert.match(extracted.providerErrorMessage ?? "", /api_key=\[redacted\]/);
    assert.equal((extracted.providerErrorMessage ?? "").length <= 500, true);
  });
});

describe("logInterpretDiagnostic", () => {
  it("logs provider error text only when NODE_ENV is development", () => {
    const lines: string[] = [];
    const originalInfo = console.info;
    console.info = (...args: unknown[]) => {
      lines.push(args.map(String).join(" "));
    };
    const previous = process.env.NODE_ENV;
    const sample = {
      event: "beforezero-interpret" as const,
      hasApiKey: true,
      model: "grok-4.3",
      httpStatus: 400,
      reason: "invalid_request" as const,
      finishReason: null,
      hasMessageContent: false,
      hasRefusal: false,
      jsonParsed: true,
      providerCodeToken: null,
      providerErrorMessage: "Unknown parameter: foo",
      providerErrorParam: "foo",
    };

    try {
      process.env.NODE_ENV = "production";
      logInterpretDiagnostic(sample);
      assert.equal(lines.at(-1)?.includes("Unknown parameter: foo"), false);

      process.env.NODE_ENV = "development";
      logInterpretDiagnostic(sample);
      assert.match(lines.at(-1) ?? "", /Unknown parameter: foo/);
      assert.match(lines.at(-1) ?? "", /"providerErrorParam":"foo"/);
    } finally {
      process.env.NODE_ENV = previous;
      console.info = originalInfo;
    }
  });
});
