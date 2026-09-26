import type { InterpretErrorCode } from "./types.ts";
import {
  extractProviderClientError,
  redactCredentialLikeText,
} from "./providerError.ts";

export { extractProviderClientError, redactCredentialLikeText };

export type InterpretReason =
  | "missing_credentials"
  | "auth_failed"
  | "insufficient_credits"
  | "rate_limited"
  | "timeout"
  | "unavailable_model"
  | "invalid_request"
  | "invalid_schema"
  | "validation_failed"
  | "unavailable";

export interface InterpretDiagnostic {
  event: "beforezero-interpret";
  hasApiKey: boolean;
  model: string;
  httpStatus: number | null;
  reason: InterpretReason;
  finishReason: string | null;
  hasMessageContent: boolean;
  hasRefusal: boolean;
  jsonParsed: boolean;
  providerCodeToken: string | null;
  providerErrorMessage?: string | null;
  providerErrorParam?: string | null;
}

const TOKEN = /^[A-Za-z0-9._-]{1,64}$/;
const MODEL_HINT = /\bmodel\b/i;
const SCHEMA_HINT = /\bschema\b|response_format|json_schema/i;

export function apiKeyPresent(value: string | undefined): value is string {
  return Boolean(value && value.trim().length > 0);
}

export function tokenOrNull(value: unknown): string | null {
  return typeof value === "string" && TOKEN.test(value) ? value : null;
}

export function isDevelopmentDiagnosticsEnabled(
  env: NodeJS.ProcessEnv = process.env,
): boolean {
  return env.NODE_ENV === "development";
}

export function readProviderErrorFields(payload: unknown): {
  providerCodeToken: string | null;
  mentionsModel: boolean;
  mentionsSchema: boolean;
} {
  if (!payload || typeof payload !== "object") {
    return { providerCodeToken: null, mentionsModel: false, mentionsSchema: false };
  }

  const record = payload as Record<string, unknown>;
  const nested =
    record.error && typeof record.error === "object"
      ? (record.error as Record<string, unknown>)
      : null;

  const candidates = [record.code, record.type, nested?.code, nested?.type];
  const providerCodeToken = candidates.map(tokenOrNull).find(Boolean) ?? null;

  const hintParts = [record.code, record.error, nested?.code, nested?.message, nested?.type]
    .filter((item): item is string => typeof item === "string")
    .join(" ");

  return {
    providerCodeToken,
    mentionsModel: MODEL_HINT.test(hintParts),
    mentionsSchema: SCHEMA_HINT.test(hintParts),
  };
}

export function classifyHttpFailure(
  status: number,
  payload: unknown,
): InterpretReason {
  if (status === 401 || status === 403) return "auth_failed";
  if (status === 402) return "insufficient_credits";
  if (status === 429) return "rate_limited";
  if (status === 408 || status === 504) return "timeout";
  if (status === 404) return "unavailable_model";

  const hints = readProviderErrorFields(payload);
  if (status === 400 || status === 422) {
    if (hints.mentionsModel) return "unavailable_model";
    if (hints.mentionsSchema) return "invalid_schema";
    return "invalid_request";
  }
  if (hints.mentionsModel && status >= 400) return "unavailable_model";
  return "unavailable";
}

export function publicMessage(reason: InterpretReason): string {
  switch (reason) {
    case "missing_credentials":
      return "Interpretation is not configured on this server. You can still use the listed choices.";
    case "auth_failed":
      return "Interpretation could not be authorized. You can still use the listed choices.";
    case "insufficient_credits":
      return "Interpretation is paused because the text service is out of credit. You can still use the listed choices.";
    case "rate_limited":
      return "Too many interpretation requests. Wait a moment, or use the listed choices.";
    case "timeout":
      return "The interpretation request timed out. You can still use the listed choices.";
    case "unavailable_model":
      return "The configured Grok model is not available. You can still use the listed choices.";
    case "invalid_request":
    case "invalid_schema":
      return "The interpretation request was rejected by the text service. You can still use the listed choices.";
    case "validation_failed":
      return "The interpretation response could not be read. You can still use the listed choices.";
    default:
      return "Interpretation is unavailable right now. You can still use the listed choices.";
  }
}

export function reasonToErrorCode(reason: InterpretReason): InterpretErrorCode {
  return reason;
}

export function logInterpretDiagnostic(fields: InterpretDiagnostic): void {
  const line: Record<string, unknown> = {
    event: fields.event,
    hasApiKey: fields.hasApiKey,
    model: fields.model,
    httpStatus: fields.httpStatus,
    reason: fields.reason,
    finishReason: fields.finishReason,
    hasMessageContent: fields.hasMessageContent,
    hasRefusal: fields.hasRefusal,
    jsonParsed: fields.jsonParsed,
    providerCodeToken: fields.providerCodeToken,
  };

  if (isDevelopmentDiagnosticsEnabled()) {
    line.providerErrorMessage = fields.providerErrorMessage ?? null;
    line.providerErrorParam = fields.providerErrorParam ?? null;
  }

  console.info("[beforezero-interpret]", JSON.stringify(line));
}
